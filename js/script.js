let table = [];
let ajaxSetup = {
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
    },
};
if (typeof user !== "undefined") {
    ajaxSetup["headers"]["Api-Token"] = user.api_token;
}
$.ajaxSetup(ajaxSetup);
const DataTableInit = {
    processing: true,
    serverSide: true,
    cache: false,
    // scrollY: '60vh',
    // scrollCollapse: true,
    // scrollX: true,
    autoWidth: false,
    bLengthChange: false, //thought this line could hide the LengthMenu
    // "bInfo":false,
    ordering: false,
    searching: false,
    language: {
        search: "Tìm kiếm ",
        searchPlaceholder: "nhập từ khóa...",
        sLengthMenu: "Xem _MENU_ mục",
        paginate: {
            next: '<span class="fas fa-chevron-right"></span>', // or '→'
            previous: '<span class="fas fa-chevron-left"></span>', // or '←'
        },
        sProcessing: "Đang xử lý...",
        emptyTable: "Không tìm thấy dòng nào phù hợp",
        sZeroRecords: "Không tìm thấy dòng nào phù hợp",
        sInfo: "Đang xem _START_ đến _END_ trong tổng số _TOTAL_ mục",
        sInfoEmpty: "Đang xem 0 đến 0 trong tổng số 0 mục",
        sInfoFiltered: "(được lọc từ _MAX_ mục)",
        sInfoPostFix: "",
        sUrl: "",
    },
    // lengthMenu: [
    //     [5, 10, 15, 50, 100, 200, 500, 1000, 5000, -1],
    //     [5, 10, 15, 50, 100, 200, 500, 1000, 5000, 'All']
    // ],
    // pageLength: 5,
    drawCallback: function() {
        $(".dataTables_paginate > .pagination").addClass(
            "custom-pagination pagination-simple"
        );
    },
    // createdRow: function (row, data, dataIndex, cells) {
    //     $(row).addClass('hover-actions-trigger btn-reveal-trigger position-static');
    // },
};

(function() {
    loadTable();
    submitForm();
    $(".multi-select-placeholder").map(function() {
        let select = $(this);
        select.select2({
            placeholder: select ? .attr("placeholder")
        });
    });
})();

function submitForm() {
    $(".hvl-form").submit(function(e) {
        e.preventDefault();
        let _this = this;
        let url = $(_this).attr("action");
        let method = $(_this).attr("method");
        let resetForm = $(_this).attr("resetForm");
        let data = $(_this).serialize();
        let hideModal = $(_this).attr("hideModal");
        let reloadTable = $(_this).attr("reloadTable");
        let callback_function = $(_this).attr("callback_function");
        let href = $(_this).attr("href");
        let button = $(_this).find("button[type=submit]");
        let oldTextButton = button.html();
        let option = {
            type: method,
            url: url,
            data: data,
            dataType: "json",
        };
        option.beforeSend = function() {
            waitButton(button, true);
        };
        option.complete = function() {
            waitButton(button, false, oldTextButton);
        };
        option.success = async function(response) {
            if (callback_function) {
                window[callback_function](response);
            }
            swal(
                response.message,
                response.status === true ? "success" : "error"
            );
            if (response.status) {
                if (resetForm != "false") {
                    $(_this).trigger("reset");
                }
                if (hideModal) {
                    $(hideModal).modal("hide");
                }
                if (reloadTable) {
                    table[reloadTable].ajax.reload();
                }
                if (href) {
                    if (href === "reload") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            window.location.href = href;
                        }, 2000);
                    }
                }
            }
        };
        $.ajax(option);
    });
}

function statusDisplay(status) {
    switch (status) {
        case "on":
            var obj = {
                name: "Đang hiển thị",
                type: "success",
            };
            break;
        default:
            var obj = {
                name: "Đang ẩn",
                type: "primary",
            };
            break;
    }
    return obj;
}

function statusDisplayServer(status) {
    switch (status) {
        case "on":
            var obj = {
                name: "Hoạt động",
                type: "success",
            };
            break;
        default:
            var obj = {
                name: "Bảo trì",
                type: "danger",
            };
            break;
    }
    return obj;
}

function statusActionHistroyBalance(status) {
    var html;
    switch (status) {
        case "admin_plus":
            html = `<span class="badge light badge-success">Admin cộng tiền</span>`;
            break;
        case "admin_minus":
            html = `<span class="badge light badge-warning">Admin trừ tiền</span>`;
            break;
        case "admin_refund":
            html = `<span class="badge light badge-primary">Admin hoàn tiền</span>`;
            break;
        case "recharge":
            html = `<span class="badge light badge-primary">Nạp tiền</span>`;
            break;
        case "order_create":
            html = `<span class="badge light badge-primary">Tạo đơn hàng</span>`;
            break;
        case "order_refund":
            html = `<span class="badge light badge-primary">Hoàn tiền đơn</span>`;
            break;
        case "change_password":
            html = `<span class="badge light badge-warning">Đổi mật khẩu</span>`;
            break;
        default:
            html = `<span class="badge light badge-secondary">Không xác định</span>`;
            break;
    }
    return html;
}

function loadTable() {
    $(".hvl-table").each(function(index, element) {
        let tableConfigAttr = $(element).attr("config");
        let optionTable = DataTableInit;
        let tableConfig = window[tableConfigAttr];
        if (tableConfig ? .createdRow) {
            optionTable.createdRow = tableConfig.createdRow;
        }
        optionTable.columns = tableConfig.columns;
        optionTable.columnDefs = tableConfig.columnDefs;
        optionTable.ajax = {
            type: tableConfig ? .method ? tableConfig.method : "POST",
            url: tableConfig.url,
            data: function(form) {
                let data = {};
                data.page = form.start / form.length + 1;
                var formData = $(element).find("form").serializeArray();
                var filterFormData = {};
                for (var i in formData) {
                    var field = formData[i];
                    var existing = filterFormData[field["name"]];
                    if (existing) {
                        existing.push(field["value"]);
                        filterFormData[field["name"]] = existing;
                    } else {
                        filterFormData[field["name"]] = [field["value"]];
                    }
                }
                let data_send =
                    $.param(data) + "&" + $.param(filterFormData, true);

                if (typeof tableOtherData == "object") {
                    data_send = data_send + "&" + $.param(tableOtherData, true);
                }
                return data_send;
            },
            dataType: "json",
            dataFilter: function(body) {
                let response = JSON.parse(body);
                if (response.status) {
                    table[tableConfigAttr].page.len(response.data.limit);
                    return JSON.stringify({
                        recordsTotal: response.data.total,
                        recordsFiltered: response.data.total,
                        data: response.data.items,
                    });
                } else {
                    // swal(response.message, 'error');
                    return JSON.stringify({
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                    });
                }
            },
            error: function(xhr, error, code) {
                // return swal(`Error code: ${xhr.status}`, 'error');
            },
        };
        table[tableConfigAttr] = $(element)
            .find("table")
            .DataTable(optionTable);
        $(element)
            .find("form")
            .submit(function(e) {
                e.preventDefault();
                table[tableConfigAttr].draw();
            });
    });
}

function statusWebsite(status) {
    switch (status) {
        case "Success":
            var obj = {
                name: "Đã kích hoạt",
                type: "success",
            };
            break;
        default:
            var obj = {
                name: "Đang xử lý",
                type: "primary",
            };
            break;
    }
    return obj;
}

function statusRecharge(status) {
    switch (status) {
        case "Success":
            var obj = {
                name: "Thành công",
                type: "success",
            };
            break;
        default:
            var obj = {
                name: "Đang xử lý",
                type: "primary",
            };
            break;
    }
    return obj;
}

function statusNotification(status) {
    switch (status) {
        case "Hot":
            var obj = {
                name: "HOT",
                type: "success",
            };
            break;
        case "Important":
            var obj = {
                name: "Quan trọng",
                type: "danger",
            };
            break;
        default:
            var obj = {
                name: "Cập nhật",
                type: "primary",
            };
            break;
    }
    return obj;
}

function statusOrder(status) {
    switch (status) {
        case "Complete":
            var obj = {
                name: "Đã hoàn thành",
                type: "success",
            };
            break;
        case "Running":
            var obj = {
                name: "Đang chạy",
                type: "info",
            };
            break;
        case "Cancel":
            var obj = {
                name: "Hủy đơn",
                type: "danger",
            };
            break;
        case "WaitRefund":
            var obj = {
                name: "Chờ hoàn tiền",
                type: "warning",
            };
            break;
        case "Refund":
            var obj = {
                name: "Hoàn tiền",
                type: "dark",
            };
            break;
        case "AdminRefund":
            var obj = {
                name: "Admin hoàn tiền",
                type: "dark",
            };
            break;
        case "Error":
            var obj = {
                name: "Bị lỗi",
                type: "danger",
            };
            break;
        case "Pause":
            var obj = {
                name: "Tạm dừng",
                type: "warning",
            };
            break;
        default:
            var obj = {
                name: "Đang hoạt động",
                type: "primary",
            };
            break;
    }
    return obj;
}

function levelMember(level) {
    switch (level) {
        case "member":
            var obj = {
                name: "Thành viên",
                type: "warning",
            };
            break;
        case "collaborators":
            var obj = {
                name: "Cộng tác viên",
                type: "info",
            };
            break;
        case "agency":
            var obj = {
                name: "Đại lý",
                type: "primary",
            };
            break;
        case "distributor":
            var obj = {
                name: "Nhà phân phối",
                type: "success",
            };
            break;
        case "vip":
            var obj = {
                name: "Đối tác VIP",
                type: "secondary",
            };
            break;
        default:
            var obj = {
                name: "Không xác định",
                type: "warning",
            };
            break;
    }
    return obj;
}

function swal(text, icon) {
    Swal.fire({
        icon,
        title: text,
        confirmButtonText: "Tôi đã hiểu",
        confirmButtonColor: "#3874ff",
    });
}

const waitButton = function(elm, type, text = null) {
    if (type == true) {
        $(elm).attr("disabled", true)
            .html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span class="sr-only">Loading...</span> Đang xử lý...`);
    } else {
        $(elm).attr("disabled", false).html(text);
    }
};

const waitButtonNoText = function(elm, type, text = null) {
    if (type == true) {
        $(elm).attr("disabled", true)
            .html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span class="sr-only">Loading...</span>`);
    } else {
        $(elm).attr("disabled", false).html(text);
    }
};
const isURL = function(str) {
    var regex =
        /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    var pattern = new RegExp(regex);
    return pattern.test(str);
};

const formatDate = function(date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

const formatNumber = function(nStr, decSeperate = ".", groupSeperate = ",") {
    nStr += "";
    x = nStr.split(decSeperate);
    x1 = x[0];
    x2 = x.length > 1 ? "." + x[1] : "";
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + groupSeperate + "$2");
    }
    return x1 + x2;
};

function objectifyForm(formArray) {
    //serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]["name"]] = formArray[i]["value"];
    }
    return returnArray;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getContentArray(text) {
    return text
        .trim()
        .split("\n")
        .filter(function(line) {
            return line && line.trim().length;
        });
}