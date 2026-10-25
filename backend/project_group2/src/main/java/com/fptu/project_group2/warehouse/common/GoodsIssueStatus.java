package com.fptu.project_group2.warehouse.common;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum GoodsIssueStatus { PENDING, PICKING, PACKED, EXPORTED }

