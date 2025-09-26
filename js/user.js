$(document).on("click", ".btn-ConfirmId", async function() {
    let id = $(this).attr("data-id");
    let action = $(this).attr("data-action");
    let url = $(this).attr("data-url");
    let method = $(this).attr("data-method");
    let href = $(this).attr("data-href");
    let messageConfirm = $(this).attr("data-messageConfirm");
    let tableConfigAttr = $(this)
        .closest("table")
        .closest(".hvl-table")
        .attr("config");
    let data = {
        id,
    };
    if (action) {
        data.action = action;
    }
    $.confirm({
        title: "Xác nhận!",
        content: messageConfirm,
        buttons: {
            confirm: {
                text: "Tôi đồng ý",
                btnClass: "btn-danger",
                keys: ["enter", "shift"],
                action: function() {
                    $.ajax({
                        type: method ? method : "POST",
                        url,
                        data: data,
                        dataType: "json",
                        success: function(response) {
                            swal(
                                response.message,
                                response.status === true ? "success" : "error"
                            );
                            if (response.status) {
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
                                    return;
                                }
                                table[tableConfigAttr].ajax.reload();
                                return;
                            }
                        },
                    });
                },
            },
            cancel: {
                text: "Đóng",
            },
        },
    });
});

$(document).on("click", ".btn-ModalId", async function() {
    let id = $(this).attr("data-id");
    let modal = $(this).attr("data-modal");
    $(`${modal} input[name=id]`).val(id);
    $(modal).modal("show");
});

$(document).ready(function() {
    $(".select_method_payment").click(function(e) {
        e.preventDefault();
        let method = $(this).attr("data-method");
        if (method == "atm") {
            $('.select_method_payment[data-method="atm"]')
                .removeClass("btn-outline-primary")
                .addClass("btn-primary");
            $('.select_method_payment[data-method="card"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.select_method_payment[data-method="binance"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.show_method_payment[data-method="atm"]').show();
            $('.show_method_payment[data-method="card"]').hide();
            $('.show_method_payment[data-method="binance"]').hide();
        } else if (method == "card") {
            $('.select_method_payment[data-method="card"]')
                .removeClass("btn-outline-primary")
                .addClass("btn-primary");
            $('.select_method_payment[data-method="atm"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.select_method_payment[data-method="binance"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.show_method_payment[data-method="card"]').show();
            $('.show_method_payment[data-method="atm"]').hide();
            $('.show_method_payment[data-method="binance"]').hide();
        } else if (method == "binance") {
            $('.select_method_payment[data-method="binance"]')
                .removeClass("btn-outline-primary")
                .addClass("btn-primary");
            $('.select_method_payment[data-method="card"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.select_method_payment[data-method="atm"]')
                .removeClass("btn-primary")
                .addClass("btn-outline-primary");
            $('.show_method_payment[data-method="binance"]').show();
            $('.show_method_payment[data-method="atm"]').hide();
            $('.show_method_payment[data-method="card"]').hide();
        }
    });
});

function showActionOrder(data, isAdmin = false) {
    let action = data.action;
    let status = data.status;
    let message = "";
    let html = "";
    if (isAdmin) {
        html += ` <button type="button" class="btn btn-primary shadow btn-xs sharp me-1 btn-ModalShowData" 
                            data-id="${data.id}" 
                            data-object_id="${data.object_id}" 
                            data-quantity="${data.quantity}" 
                            data-comments="${data.comments}" 
                            data-num_post="${data.num_post}" 
                            data-num_day="${data.num_day}" 
                            data-time_expired="${data.time_expired}" 
                            data-start_count="${data.start_count}" 
                            data-success_count="${data.success_count}" 
                            data-note="${data.note}" 
                            data-category="${data.category}" 
                            data-service_name="${data.service_name}" 
                            data-service_id="${data.service_id}" 
                            data-server_name="${data.server_name}" 
                            data-server_id="${data.server_id}" 

                            data-reactions=${JSON.stringify(data.reactions)} 
                            data-options=${JSON.stringify(data.options)} 
                            data-source=${JSON.stringify(data.source)} 
                            data-action=${JSON.stringify(data.action)} 
                            title="Chi tiết đơn"><i class="fas fa-info"></i></button>`;
    }

    if (["Active", "Pause"].includes(status) && action.cancel) {
        if (action.refund) {
            message = `Bạn có muốn hủy đơn hoàn tiền với mã đơn #${data.id} hay không?`;
        } else {
            message = `Bạn có muốn hủy đơn không hoàn tiền với mã đơn#${data.id} hay không?`;
        }
        html += `<button
    class="btn btn-danger shadow btn-xs sharp me-1 btn-ConfirmId" data-action="cancel" data-id="${data.id}" data-url="${URL_ACTION_ORDER}" data-messageConfirm="${message}" type="button" title="Hủy đơn"><span
        class="fas fa-trash"></span></button>`;
    }
    if (status === "Pause") {
        html += `<button
    class="btn btn-warning shadow btn-xs sharp me-1 btn-ConfirmId" data-action="activate" data-id="${data.id}" data-url="${URL_ACTION_ORDER}" data-messageConfirm="Bạn có muốn kích hoạt lại với mã đơn #${data.id} hay không?" type="button" title="Kích hoạt lại"><span
        class="fas fa-play"></span></button>`;
    }
    if (status === "Complete" && action.warranty) {
        html += `<button
    class="btn btn-success shadow btn-xs sharp me-1 btn-ConfirmId" data-action="warranty" data-id="${data.id}" data-url="${URL_ACTION_ORDER}" data-messageConfirm="Bạn có muốn yêu cầu bảo hành với mã đơn #${data.id} hay không?" type="button" title="Bảo hành đơn"><span
        class="fas fa-check"></span></button>`;
    }
    return `<div class="d-flex">${html}</div>`;
}

$(document).on("click", ".btn-copy", function() {
    var target = $(this).data("target");
    var text = $(target).val() || $(target).text();
    if (!text) return;
    copyText(text);
});

$(document).on("click", ".input-copy", function() {
    var text = $(this).val() || $(this).text();
    if (!text) return;
    copyText(text);
});

function copyText(text) {
    const el = document.createElement("textarea");
    el.value = text.toString().trim();
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    swal("Đã sao chép!", "success");
}