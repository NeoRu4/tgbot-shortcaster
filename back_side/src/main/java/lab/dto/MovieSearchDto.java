package lab.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.micronaut.core.annotation.Introspected;
import lab.utils.EnumUtils;
import lab.utils.StringUtils;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Positive;

@Introspected
public class MovieSearchDto {

    @Max(100)
    @JsonProperty("max")
    private Integer max;

    @Min(0)
    @JsonProperty("offset")
    private Integer offset;

    @JsonProperty("searchString")
    private String searchString;

    @JsonProperty("orderBy")
    private OrderBy orderBy;

    @JsonProperty("orderField")
    private OrderField orderField;


    public enum OrderBy {
        asc, ASC,
        desc, DESC,
    }

    public enum OrderField {
        id,
        year,
        name,
    }

    public String getSearchString() {
        return searchString;
    }

    public void setSearchString(String searchString) {
        this.searchString = searchString;
    }

    public Integer getMax() {
        return max;
    }

    public void setMax(Integer max) {
        this.max = max;
    }

    public String getOrderBy() {
        return StringUtils.toString(this.orderBy);
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = EnumUtils.fromString(OrderBy.class, orderBy);
    }

    public void setOrderBy(OrderBy orderBy) {
        this.orderBy = orderBy;
    }

    public String getOrderField() {
        return StringUtils.toString(this.orderField);
    }

    public void setOrderField(String orderField) {
        this.orderField = EnumUtils.fromString(OrderField.class, orderField);
    }

    public void setOrderField(OrderField orderField) {
        this.orderField = orderField;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset;
    }

}


