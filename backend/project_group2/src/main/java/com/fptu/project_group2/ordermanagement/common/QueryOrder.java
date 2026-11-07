
package com.fptu.project_group2.ordermanagement.common;

public final class QueryOrder {
    private QueryOrder() {
    }

    private static final String FILTER = """
            where (:status is null or o.status = :status)
              and (:search = '' or
                   lower(o.orderCode) like lower(concat('%', :search, '%')) or
                   lower(o.receiverName) like lower(concat('%', :search, '%')) or
                   o.receiverPhone like concat('%', :search, '%'))
            """;

    public static final String FIND_PAGE_IDS = "select o.id from Order o " + FILTER;
    public static final String COUNT_PAGE_IDS = "select count(o) from Order o " + FILTER;

}
