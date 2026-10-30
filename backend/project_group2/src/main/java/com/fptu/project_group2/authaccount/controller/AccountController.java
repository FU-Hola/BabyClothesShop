package com.fptu.project_group2.authaccount.controller;

import com.fptu.project_group2.authaccount.dto.request.AccountSearchRequest;
import com.fptu.project_group2.authaccount.dto.request.AccountStatusRequest;
import com.fptu.project_group2.authaccount.dto.request.CreateStaffRequest;
import com.fptu.project_group2.authaccount.dto.request.UpdateStaffRequest;
import com.fptu.project_group2.authaccount.dto.response.AccountListResponse;
import com.fptu.project_group2.authaccount.dto.response.AccountResponse;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.authaccount.service.AccountService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
// hasRole tự thêm tiền tố ROLE_ và đối chiếu với GrantedAuthority của user đăng nhập.
@PreAuthorize("hasRole('ADMIN')")
public class AccountController {
    private final AccountService accountService;

    @GetMapping("/{accountType:staff|customers}")
    public ResponseEntity<ApiResponse<AccountListResponse>> list(
            @PathVariable String accountType, @Valid @ModelAttribute AccountSearchRequest request
    ) {
        return ResponseBuilder.ok(accountService.list(accountType, request), "Lấy danh sách tài khoản thành công");
    }

    @GetMapping("/{accountType:staff|customers}/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> get(@PathVariable String accountType, @PathVariable UUID id) {
        return ResponseBuilder.ok(accountService.get(accountType, id), "Lấy thông tin tài khoản thành công");
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<AccountResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest request, @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseBuilder.created(accountService.createStaff(request, principal.id()), "Tạo nhân viên thành công");
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateStaff(
            @PathVariable UUID id, @Valid @RequestBody UpdateStaffRequest request
    ) {
        return ResponseBuilder.ok(accountService.updateStaff(id, request), "Cập nhật nhân viên thành công");
    }

    @PatchMapping("/{accountType:staff|customers}/{id}/status")
    public ResponseEntity<ApiResponse<AccountResponse>> updateStatus(
            @PathVariable String accountType, @PathVariable UUID id, @Valid @RequestBody AccountStatusRequest request
    ) {
        return ResponseBuilder.ok(accountService.updateStatus(accountType, id, request.status()),
                "active".equals(request.status()) ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    }

    @DeleteMapping("/{accountType:staff|customers}/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> softDelete(@PathVariable String accountType, @PathVariable UUID id) {
        return ResponseBuilder.ok(accountService.softDelete(accountType, id), "Đã xóa mềm tài khoản");
    }

    @PatchMapping("/{accountType:staff|customers}/{id}/restore")
    public ResponseEntity<ApiResponse<AccountResponse>> restore(@PathVariable String accountType, @PathVariable UUID id) {
        return ResponseBuilder.ok(accountService.restore(accountType, id), "Đã khôi phục tài khoản");
    }
}
