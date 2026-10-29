package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.dto.request.AccountSearchRequest;
import com.fptu.project_group2.authaccount.dto.request.CreateStaffRequest;
import com.fptu.project_group2.authaccount.dto.request.UpdateStaffRequest;
import com.fptu.project_group2.authaccount.dto.response.AccountListResponse;
import com.fptu.project_group2.authaccount.dto.response.AccountResponse;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Quản lý hồ sơ và vòng đời account, tách khỏi nghiệp vụ đăng nhập trong AuthService.
 * Chỉ có nhóm nhân viên và khách hàng; các API này không quản lý tài khoản ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AccountService {
    private static final List<UserRole> STAFF_ROLES = List.of(UserRole.STORE_STAFF, UserRole.WAREHOUSE_STAFF);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AccountListResponse list(String accountType, AccountSearchRequest request) {
        List<UserRole> roles = rolesFor(accountType);
        Specification<User> filter = filter(roles, request.search(), request.status());
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        var page = userRepository.findAll(filter, PageRequest.of(request.page() - 1, request.pageSize(), sort));
        int totalPages = Math.max(1, page.getTotalPages());
        // Nếu trang cuối vừa bị xóa hết dữ liệu, đưa người dùng về trang còn tồn tại.
        if (request.page() > totalPages) {
            page = userRepository.findAll(filter, PageRequest.of(totalPages - 1, request.pageSize(), sort));
        }
        var stats = new AccountListResponse.Stats(
                userRepository.count(filter(roles, "", "all")),
                userRepository.count(filter(roles, "", "active")),
                userRepository.count(filter(roles, "", "blocked")),
                userRepository.count(filter(roles, "", "deleted"))
        );
        return new AccountListResponse(
                page.getContent().stream().map(AccountResponse::from).toList(),
                new AccountListResponse.Pagination(page.getNumber() + 1, page.getSize(), page.getTotalElements(), totalPages),
                stats
        );
    }

    @Transactional(readOnly = true)
    public AccountResponse get(String accountType, UUID id) {
        User user = userRepository.findById(id).orElseThrow(this::notFound);
        requireGroup(user, accountType);
        return AccountResponse.from(user);
    }

    @Transactional
    public AccountResponse createStaff(CreateStaffRequest request, UUID adminId) {
        if (request.role() == null || !STAFF_ROLES.contains(request.role())) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                    "Nhân viên chỉ được có quyền STORE_STAFF hoặc WAREHOUSE_STAFF");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        checkEmployeeCode(request.employeeCode(), null);
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setEmployeeCode(request.employeeCode());
        user.setPosition(request.position());
        user.setRole(request.role());
        user.setStatus(UserStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // Người tạo lấy từ principal ADMIN đã xác thực, không nhận createdBy từ client.
        user.setCreatedBy(userRepository.getReferenceById(adminId));
        return save(user);
    }

    @Transactional
    public AccountResponse updateStaff(UUID id, UpdateStaffRequest request) {
        User user = findForUpdate("staff", id);
        requireNotDeleted(user);
        // DTO cập nhật không có email; chỉ ghi các trường hồ sơ bên dưới.
        checkEmployeeCode(request.employeeCode(), id);
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setEmployeeCode(request.employeeCode());
        user.setPosition(request.position());
        return save(user);
    }

    @Transactional
    public AccountResponse updateStatus(String accountType, UUID id, String status) {
        User user = findForUpdate(accountType, id);
        requireNotDeleted(user);
        if (!"active".equals(status) && !"blocked".equals(status)) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Trạng thái không hợp lệ");
        }
        // Giao diện gọi là blocked; trong database dùng trạng thái INACTIVE đã có.
        user.setStatus("active".equals(status) ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        if (user.getStatus() == UserStatus.INACTIVE) {
            clearRefreshToken(user);
        }
        return save(user);
    }

    @Transactional
    public AccountResponse softDelete(String accountType, UUID id) {
        User user = findForUpdate(accountType, id);
        requireNotDeleted(user);
        // Xóa mềm để giữ lịch sử và liên kết đơn hàng; không xóa dòng users.
        user.setDeletedAt(Instant.now());
        user.setStatus(UserStatus.INACTIVE);
        clearRefreshToken(user);
        return save(user);
    }

    @Transactional
    public AccountResponse restore(String accountType, UUID id) {
        User user = findForUpdate(accountType, id);
        if (user.getDeletedAt() == null) {
            throw new BaseBusinessException(ErrorCode.ACCOUNT_STATE_CONFLICT, "Tài khoản này chưa bị xóa");
        }
        user.setDeletedAt(null);
        user.setStatus(UserStatus.ACTIVE);
        // Khôi phục hồ sơ không khôi phục refresh token cũ; cần đăng nhập lại.
        clearRefreshToken(user);
        return save(user);
    }

    private Specification<User> filter(List<UserRole> roles, String search, String status) {
        // Ghép điều kiện tìm kiếm trên database; Spring áp dụng phân trang cho kết quả này.
        return (root, query, builder) -> {
            var conditions = new ArrayList<Predicate>();
            conditions.add(root.get("role").in(roles));
            if ("deleted".equals(status)) {
                conditions.add(builder.isNotNull(root.get("deletedAt")));
            } else if (!"all".equals(status)) {
                conditions.add(builder.isNull(root.get("deletedAt")));
                conditions.add(builder.equal(root.get("status"),
                        "active".equals(status) ? UserStatus.ACTIVE : UserStatus.INACTIVE));
            }
            if (!search.isBlank()) {
                // Escape ký tự LIKE để tìm chuỗi người dùng nhập, không coi %/_ là wildcard.
                String pattern = "%" + search.toLowerCase(Locale.ROOT)
                        .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                List<String> fields = roles.equals(STAFF_ROLES)
                        ? List.of("fullName", "email", "phone", "employeeCode", "position")
                        : List.of("fullName", "email", "phone", "address");
                Predicate[] matches = fields.stream()
                        .map(field -> builder.like(builder.lower(root.get(field)), pattern, '\\'))
                        .toArray(Predicate[]::new);
                conditions.add(builder.or(matches));
            }
            return builder.and(conditions.toArray(Predicate[]::new));
        };
    }

    private User findForUpdate(String accountType, UUID id) {
        // Dùng cùng khóa dòng với login/refresh để không cập nhật chồng trạng thái tài khoản.
        User user = userRepository.findByIdForUpdate(id).orElseThrow(this::notFound);
        requireGroup(user, accountType);
        return user;
    }

    private List<UserRole> rolesFor(String accountType) {
        return switch (accountType) {
            case "staff" -> STAFF_ROLES;
            case "customers" -> List.of(UserRole.CUSTOMER);
            default -> throw notFound();
        };
    }

    private void requireGroup(User user, String accountType) {
        if (!rolesFor(accountType).contains(user.getRole())) {
            throw notFound();
        }
    }

    private void requireNotDeleted(User user) {
        if (user.getDeletedAt() != null) {
            throw new BaseBusinessException(ErrorCode.ACCOUNT_STATE_CONFLICT,
                    "Hãy khôi phục tài khoản trước khi chỉnh sửa hoặc đổi trạng thái");
        }
    }

    private void checkEmployeeCode(String employeeCode, UUID excludedId) {
        if (userRepository.findByEmployeeCodeIgnoreCase(employeeCode)
                .filter(u -> !u.getId().equals(excludedId)).isPresent()) {
            throw new BaseBusinessException(ErrorCode.EMPLOYEE_CODE_ALREADY_EXISTS);
        }
    }

    private AccountResponse save(User user) {
        try {
            return AccountResponse.from(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException exception) {
            // Unique constraint vẫn bảo vệ khi hai request cùng tạo email/mã giống nhau.
            throw new BaseBusinessException(ErrorCode.ACCOUNT_DATA_CONFLICT);
        }
    }

    private void clearRefreshToken(User user) {
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
    }

    private BaseBusinessException notFound() {
        return new BaseBusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản trong nhóm này");
    }
}
