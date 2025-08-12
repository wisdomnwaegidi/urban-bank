jQuery(document).ready(function () {
// bw_testimonial_section
  var swiper = new Swiper(".bw_testimonial_section .mySwiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    pagination: {
      el: ".bw_testimonial_section .swiper-pagination",
      type: "fraction",
    }
  });
// bw_testimonial_section

  var swiper = new Swiper(".bw_testimonial_content_slider .mySwiper", {
    loop: true, 
    spaceBetween: 0,
    slidesPerView: 1,
  // centeredSlides: true,
  // navigation: {
  //   nextEl: ".bw_testimonial_content_slider .swiper-button-next",
  //   prevEl: ".bw_testimonial_content_slider .swiper-button-prev",
  // },
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
   // freeMode: true,
  // watchSlidesProgress: true,

  });
  var swiper2 = new Swiper(".bw_testimonial_content_slider .mySwiper2", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    centeredSlides: true,
    navigation: {
      nextEl: ".bw_testimonial_content_slider .swiper-button-next",
      prevEl: ".bw_testimonial_content_slider .swiper-button-prev",
    },
    thumbs: {
      swiper: swiper,
    },
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
    breakpoints: {
      575: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      991: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    },

  });




// bw_testimonial_two_section

  // var slider = new Swiper(".bw_testimonial_two_section .mySwiper", {
  //   loop: true,
  //   spaceBetween: 0,
  //   slidesPerView: 1,
  //   freeMode: false,
  //   watchSlidesProgress: false,
  //   pagination: {
  //     el: ".bw_testimonial_two_section .swiper-pagination",
  //     dynamicBullets: true,
  //   },
  //   centeredSlides: true,
  //   navigation: {
  //     nextEl: ".bw_testimonial_two_section .swiper-button-next",
  //     prevEl: ".bw_testimonial_two_section .swiper-button-prev",
  //   },
  // });
  // var thumbs = new Swiper(".bw_testimonial_two_section .mySwiper2", {
  //   loop: true,
  //   slidesPerView: 1,
  //   spaceBetween: 10,
  //   centeredSlides: true,
  //   slideToClickedSlide: true,
  //   thumbs: {
  //     swiper: swiper,
  //   },
  //   breakpoints: {
  //     575: {
  //       slidesPerView: 3,
  //       spaceBetween: 10,
  //     },
  //     991: {
  //       slidesPerView: 5,
  //       spaceBetween: 20,
  //     },
  //   },
  // });


  // slider.controller.control = thumbs;
  // thumbs.controller.control = slider;



  var slider = new Swiper ('.bw_testimonial_two_section .bw_testimonial_two_content', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    loopedSlides: 1,
    pagination: {
      el: ".bw_testimonial_two_section .swiper-pagination",
      dynamicBullets: true,
    },
    navigation: {
      nextEl: '.bw_testimonial_two_section .swiper-button-next',
      prevEl: '.bw_testimonial_two_section .swiper-button-prev',
    },
    breakpoints: {
      575: {
        loopedSlides: 3,
      },
      991: {
        loopedSlides: 5,
      },
    },
  });

  var thumbs = new Swiper ('.bw_testimonial_two_section .bw_testimonial_two_img', {
    slidesPerView: 1,
    spaceBetween: 10,
    centeredSlides: true,
    loop: true,
    slideToClickedSlide: true,
    breakpoints: {
      575: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      991: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    },
  });

  slider.controller.control = thumbs;
  thumbs.controller.control = slider;




  // bw_team_slider_section
  var swiper = new Swiper(".bw_team_slider_section .mySwiper", {
    spaceBetween: 0,
    slidesPerView: 1,
    pagination: {
      el: ".bw_team_slider_section .swiper-pagination",
      type: "fraction",
    },
    breakpoints: {
      "576": {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      "992": {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
// bw_team_slider_section

  // bw_blog_section
  var swiper = new Swiper(".bw_blog_section .mySwiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    navigation: {
      nextEl: ".bw_blog_section .swiper-button-next",
      prevEl: ".bw_blog_section .swiper-button-prev",
    },
    breakpoints: {
      575: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      991: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
  // bw_blog_section
   // bw_blog_section_two
  var swiper = new Swiper(".bw_blog_section_two .mySwiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    navigation: {
      nextEl: ".bw_blog_section_two .swiper-button-next",
      prevEl: ".bw_blog_section_two .swiper-button-prev",
    },
    breakpoints: {
      575: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      767: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1199: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
  // bw_blog_section

  // svg_line_repetar
  customElements.define(
    "svg-path-elements",
    class extends HTMLElement {
      connectedCallback() {
        let id = "curve" + this.getAttribute("id");
        let speed = 1;
        let position = 0;
        let elements = Array(~~this.getAttribute("count") || 5)
        .fill(0)
        .map((_, idx, arr) => {
          let inlineFunctionOnEnd = `this.closest('svg').parentNode.onend(${idx})`;
          let circle = `<svg id="circle${idx}" width="1147" height="412" viewBox="0 0 1147 412" fill="none">
          <path  d="M0.906792 411.22C53.9068 360.554 222.607 268.42 473.407 305.22C663.907 347.22 1041.91 316.72 1145.91 0.720215" stroke="#2C3333" stroke-opacity="0.15" stroke-width="0.965779"/>
          </svg>`;
          position += 1 / (arr.length - 1);
          return circle;
        })
        .join("");
        this.innerHTML = `<svg width="1147" height="412" viewBox="0 0 1147 412" fill="none">
        <path id="${id}" d="M0.906792 411.22C53.9068 360.554 222.607 268.42 473.407 305.22C663.907 347.22 1041.91 316.72 1145.91 0.720215" stroke="#2C3333" stroke-opacity="0.15" stroke-width="0.965779"/>
        </svg>${elements}`;
      }
      onend(idx) {
        let circle = this.querySelector("#circle" + idx);
      }
    }
    );
  // svg_line_repetar

  // create_page_url_in_body_class
  var URL = window.location.pathname;
  var page = URL.split("/").pop().split(".").shift();
  jQuery("body").addClass(page);
  // create_page_url_in_body_class

  // login_page
  jQuery(".bw_login_page_wrap .bw_login_click").click(function () {
    jQuery(
      ".bw_regisiter_wrap, .bw_forgot_password_wrap, .bw_reset_password_wrap"
      ).removeClass("active");
    jQuery(".bw_login_wrap").addClass("active");
  });
  jQuery(".bw_login_page_wrap .bw_register_click").click(function () {
    jQuery(
      ".bw_login_wrap, .bw_forgot_password_wrap, .bw_reset_password_wrap"
      ).removeClass("active");
    jQuery(".bw_regisiter_wrap").addClass("active");
  });
  jQuery(".bw_login_page_wrap .bw_forgot_cilck").click(function () {
    jQuery(".bw_login_wrap").removeClass("active");
    jQuery(".bw_forgot_password_wrap").addClass("active");
  });
  jQuery(
    ".bw_login_page_wrap .bw_forgot_password_wrap a.bw_custom_buttom"
    ).click(function () {
      jQuery(".bw_forgot_password_wrap").removeClass("active");
      jQuery(".bw_reset_password_wrap").addClass("active");
    });
  // login_page

  // bw_header
    jQuery(window).scroll(function () {
      if (jQuery(this).scrollTop() > 0) {
        jQuery(".bw_header, .bw_header_two").addClass("bw_sticky");
      } else {
        jQuery(".bw_header, .bw_header_two").removeClass("bw_sticky");
      }
    });

    $(".bw_drop_down_wrap").click(function () {
      $(".bw_drop_down_wrap .bw_dropdown_menu").slideToggle();
      $(this).toggleClass("active");
    });

    jQuery(".bw_mobile_menu_icon a").click(function () {
      jQuery(".bw_menubar_wrap").addClass("open");
    });
    jQuery(".bw_menubar_close").click(function () {
      jQuery(".bw_menubar_wrap").removeClass("open");
    });
    
    jQuery(".bw_header_two .bw_mobile_menu_icon a").click(function () {
      jQuery(".bw_header_two").addClass("open");
    });
    jQuery(".bw_header_two .bw_mobile_menu_closer").click(function () {
      jQuery(".bw_header_two").removeClass("open");
    });

  // bw_header

    


    jQuery("ul.tabs li").click(function () {
      var tab_id = jQuery(this).attr("data-tab");

      jQuery("ul.tabs li").removeClass("current");
      jQuery(".tab-content").removeClass("current");

      jQuery(this).addClass("current");
      jQuery("#" + tab_id).addClass("current");
    });

    //===== start accordian js =====//

    jQuery("body").on("click", ".accordion .accordion-tabs", function () {
      console.log('fgf');
      jQuery(".accordion-content").slideUp(),
      jQuery(this).hasClass("acco-active")
      ? (jQuery(this).next(".accordion-content").slideUp(),
        jQuery(this).removeClass("acco-active"))
       //jQuery('.accordion-item').removeClass('bw-active-tab'),
        //jQuery(this).parent().addClass('bw-active-tab'),
      : (jQuery(".accordion .accordion-tabs").removeClass("acco-active"),
        jQuery('.accordion-item').removeClass('bw-active-tab'),
        jQuery(this).parent().addClass('bw-active-tab'),
        jQuery(this).addClass("acco-active"),
        jQuery(this).next(".accordion-content").slideDown());
      jQuery(".accordion .accordion-tabs h5 span.accordion_icon").text("add");
      jQuery(
        ".accordion .accordion-tabs.acco-active h5 span.accordion_icon"
        ).text("remove");

      jQuery(".bw_faq_page_section_2 .accordion .accordion-tabs h5 span.accordion_icon").text("expand_more");
      jQuery(
        ".bw_faq_page_section_2 .accordion .accordion-tabs.acco-active h5 span.accordion_icon"
        ).text("expand_less");

    });

    //===== End accordian js =====//

    //===== start accordian add class js =====//

    jQuery(".accordion-tabs.acco-active").parent().addClass('bw-active-tab');

    //===== End accordian add class js =====//



    $(".bw_custom_popup").magnificPopup({
      type: "inline",
      preloader: false,
      focus: "#name",
    });


    jQuery(document).on("click", ".bw_card_popup .bw_custom_buttom", function () {
      jQuery("button.mfp-close").click();
      jQuery(".bw_hero_custom_card > .creditcard.flipped").click();
    });

    $(".counter").counterUp({
      delay: 10,
      time: 500,
    });
    $(".counter").addClass("animated fadeInDownBig");
    $(".bw_hero_card h3").addClass("animated fadeIn");

    //===== start all animation js =====//

    AOS.init({
      once: true,
    });

    //===== End all animation js =====//
    //===== start ripples js =====//
    jQuery(".bw_ripples, .bw_main_body").ripples({
      resolution: 512,
      dropRadius: 15,
      perturbance: 50,
    });

    var CurrentUrl = document.URL;
    var CurrentUrlEnd = CurrentUrl.split("/").filter(Boolean).pop();
    console.log(CurrentUrlEnd);
    $(".bw_all_menu li a").each(function () {
      var ThisUrl = $(this).attr("href");
      var ThisUrlEnd = ThisUrl.split("/").filter(Boolean).pop();

      if (ThisUrlEnd == CurrentUrlEnd) {
        $(this).closest("li").addClass("current_page_active");
      }
    });
  });
  //===== End ripples js =====//


$(document).ready(function () {
  // start_after_and_before_slider
  // start_after_and_before_slider
  jQuery(".popup-vimeo .play").hide();
  jQuery(".popup-vimeo").click(function () {
    if (jQuery("video").get(0).paused) {
      jQuery("video").get(0).play();
      jQuery(".popup-vimeo .playpause").fadeOut();
      jQuery(".popup-vimeo .play").fadeIn();
    } else {
      jQuery("video").get(0).pause();
      jQuery(".popup-vimeo .playpause").fadeIn();
      jQuery(".popup-vimeo .play").fadeOut();
    }
  });

  let active = false;

  document
  .querySelector(".scroller")
  .addEventListener("mousedown", function () {
    active = true;
    document.querySelector(".scroller").classList.add("scrolling");
  });
  document.body.addEventListener("mouseup", function () {
    active = false;
    document.querySelector(".scroller").classList.remove("scrolling");
  });
  document.body.addEventListener("mouseleave", function () {
    active = false;
    document.querySelector(".scroller").classList.remove("scrolling");
  });

  document.body.addEventListener("mousemove", function (e) {
    if (!active) return;
    let x = e.pageX;
    x -= document
    .querySelector(".bw_video_Slider")
    .getBoundingClientRect().left;
    scrollIt(x);
  });

  function scrollIt(x) {
    let transform = Math.max(
      0,
      Math.min(x, document.querySelector(".bw_video_Slider").offsetWidth)
      );
    document.querySelector(".after").style.width = transform + "px";
    document.querySelector(".scroller").style.left = transform - 16 + "px";
  }

  scrollIt("50%");

  document
  .querySelector(".scroller")
  .addEventListener("touchstart", function () {
    active = true;
    document.querySelector(".scroller").classList.add("scrolling");
  });

  document.body.addEventListener("touchend", function () {
    active = false;
    document.querySelector(".scroller").classList.remove("scrolling");
  });

  document.body.addEventListener("touchcancel", function () {
    active = false;
    document.querySelector(".scroller").classList.remove("scrolling");
  });

  // end_after_and_before_slider
  // end_after_and_before_slider

  // Start_bw_home_hero_section_cred
  // Start_bw_home_hero_section_cred
  window.onload = function () {
    const name = document.getElementById("name");
    const cardnumber = document.getElementById("cardnumber");
    const expirationdate = document.getElementById("expirationdate");
    const securitycode = document.getElementById("securitycode");
    let cctype = null;

    //Mask the Credit Card Number Input
    var cardnumber_mask = new IMask(cardnumber, {
      mask: [
      {
        mask: "0000 0000 0000 0000",
        regex: "^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}",
        cardtype: "maestro",
      },
      {
        mask: "0000 0000 0000 0000",
        regex: "^4\\d{0,15}",
        cardtype: "visa",
      },
      ],
      dispatch: function (appended, dynamicMasked) {
        var number = (dynamicMasked.value + appended).replace(/\D/g, "");
        for (var i = 0; i < dynamicMasked.compiledMasks.length; i++) {
          let re = new RegExp(dynamicMasked.compiledMasks[i].regex);
          if (number.match(re) != null) {
            return dynamicMasked.compiledMasks[i];
          }
        }
      },
    });

    //Mask the Expiration Date
    var expirationdate_mask = new IMask(expirationdate, {
      mask: "MM{/}YY",
      groups: {
        YY: new IMask.MaskedPattern.Group.Range([0, 99]),
        MM: new IMask.MaskedPattern.Group.Range([1, 12]),
      },
    });

    //Mask the security code
    var securitycode_mask = new IMask(securitycode, {
      mask: "0000",
    });

    // CREDIT CARD IMAGE JS
    document.querySelector(".preload").classList.remove("preload");
    document
    .querySelector(".creditcard")
    .addEventListener("click", function () {
      if (this.classList.contains("flipped")) {
        this.classList.remove("flipped");
      } else {
        this.classList.add("flipped");
      }
    });

    //On Input Change Events
    name.addEventListener("input", function () {
      if (name.value.length == 0) {
        document.getElementById("svgname").innerHTML = "Ghoghari Dharmesh";
        document.getElementById("svgnameback").innerHTML = "Ghoghari Dharmesh";
      } else {
        document.getElementById("svgname").innerHTML = this.value;
        document.getElementById("svgnameback").innerHTML = this.value;
      }
    });

    cardnumber_mask.on("accept", function () {
      if (cardnumber_mask.value.length == 0) {
        document.getElementById("svgnumber").innerHTML = "0123 4567 8910 1112";
      } else {
        document.getElementById("svgnumber").innerHTML = cardnumber_mask.value;
      }
    });

    expirationdate_mask.on("accept", function () {
      if (expirationdate_mask.value.length == 0) {
        document.getElementById("svgexpire").innerHTML = "01/23";
      } else {
        document.getElementById("svgexpire").innerHTML =
        expirationdate_mask.value;
      }
    });

    securitycode_mask.on("accept", function () {
      if (securitycode_mask.value.length == 0) {
        document.getElementById("svgsecurity").innerHTML = "012";
      } else {
        document.getElementById("svgsecurity").innerHTML =
        securitycode_mask.value;
      }
    });

    //On Focus Events
    name.addEventListener("focus", function () {
      document.querySelector(".creditcard").classList.remove("flipped");
    });

    cardnumber.addEventListener("focus", function () {
      document.querySelector(".creditcard").classList.remove("flipped");
    });

    expirationdate.addEventListener("focus", function () {
      document.querySelector(".creditcard").classList.remove("flipped");
    });

    securitycode.addEventListener("focus", function () {
      document.querySelector(".creditcard").classList.add("flipped");
    });
  };

  // end_bw_home_hero_section_cred
  // end_bw_home_hero_section_cred



  







  
});
