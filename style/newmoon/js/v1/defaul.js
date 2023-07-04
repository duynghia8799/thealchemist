
$(document).ready(function () {
    $("body").hasClass("style-dark");
    $(window).scroll(function () {
        if ($(this).scrollTop() != 0) {
            $('.icon-back-top').fadeIn();
        } else {
            $('.icon-back-top').fadeOut();
        }
    });
    $('.icon-back-top').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 200);
    });
    //// 
    $('li.dropdown').hover(function () {
        $(this).addClass('open');
        $(this).find('.sub-menu').delay(200).fadeIn(200);
    },
            function () {
                $(this).removeClass('open');
                $(this).find('.sub-menu').fadeOut(100);
            });

});
///style-dark


$(".btn-convert-color").click(function () {
    if ($("body").hasClass("style-dark")) {
        $("body").removeClass("style-dark");
        window.location.href = '?style=normal';
    } else {
        $("body").addClass("style-dark");
        window.location.href = '?style=dark';
    }

});
///search			
$(".btn-search").click(function () {
    if ($(".box-search-head").hasClass("open")) {
        $(".box-search-head").removeClass("open");
    } else {
        $(".box-search-head").addClass("open");
    }

});
$(".view-pass").click(function () {
    var $pw = $(this).closest('.pass'),
            $input = $pw.find('input');
    if ($pw.hasClass("open")) {
        $pw.removeClass("open");
        $input.attr('type', 'password');
    } else {
        $pw.addClass("open");
        $input.attr('type', 'text');
    }

}
);
$(".inputpass").on('keyup', function () {
    var $v = $(this).val() || "";
    let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
    let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))');

    var str = '';
    var $div = $(this).closest('li').find(".box-pass-strength");
    if (strongPassword.test($v) || $v.length > 20) {
        str += '<div class="pass-strength"><div class="item strong"></div><div class="item strong"></div><div class="item strong"></div><div class="item"></div></div>';
        str += '<p class="note-text">Strong Password!</p>';
    } else if (mediumPassword.test($v) || ($v.length > 12 && $v.length < 20)) {
        str += '<div class="pass-strength"><div class="item strong"></div><div class="item strong"></div><div class="item"></div><div class="item"></div></div>';
        str += '<p class="note-text">Medium Password!</p>';
    } else {
        str += '<div class="pass-strength"><div class="item strong"></div><div class="item"></div><div class="item"></div><div class="item"></div></div>';
        str += '<p class="note-text">Weak Password!</p>';
    }
    $div.html(str);
});



                