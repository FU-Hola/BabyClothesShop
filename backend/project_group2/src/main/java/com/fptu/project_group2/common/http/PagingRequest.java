package com.fptu.project_group2.common.http;

import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.helper.MessageHelper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PagingRequest {

    private int page = 1;
    private int size = 10;

    public Pageable toPageable() {
        validate();
        return PageRequest.of(toZeroBasedPage(), size, Sort.by(Sort.Direction.DESC, "id"));
    }

    public Pageable toPageable(Sort sort) {
        validate();
        return PageRequest.of(toZeroBasedPage(), size, sort);
    }

    private void validate() {
        if (page < 1) {
            throw new BadRequestException(MessageHelper.getMessage("error.pagination.page.invalid"));
        }
        // Giới hạn chung cho các API, tránh tải một trang quá lớn.
        if (size <= 0 || size > 100) {
            throw new BadRequestException("size phải từ 1 đến 100");
        }
    }

    private int toZeroBasedPage() {
        return page - 1;
    }
}
