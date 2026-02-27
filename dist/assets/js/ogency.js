(function ($) {
  "use strict";

  if ($(".contact-form-validated").length) {
    $(".contact-form-validated").validate({
      // initialize the plugin
      rules: {
        name: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        message: {
          required: true,
        },
        subject: {
          required: true,
        },
      },
      submitHandler: function (form) {
        if ($(form).is("#contact-form") || $(form).is("#home-contact-form")) {
          return false;
        }
        // sending value with ajax request
        $.post(
          $(form).attr("action"),
          $(form).serialize(),
          function (response) {
            $(form).parent().find(".result").append(response);
            $(form).find('input[type="text"]').val("");
            $(form).find('input[type="email"]').val("");
            $(form).find("textarea").val("");
          }
        );
        return false;
      },
    });
  }

  // mailchimp form
  if ($(".mc-form").length) {
    $(".mc-form").each(function () {
      var Self = $(this);
      var mcURL = Self.data("url");
      var mcResp = Self.parent().find(".mc-form__response");

      Self.ajaxChimp({
        url: mcURL,
        callback: function (resp) {
          // appending response
          mcResp.append(function () {
            return '<p class="mc-message">' + resp.msg + "</p>";
          });
          // making things based on response
          if (resp.result === "success") {
            // Do stuff
            Self.removeClass("errored").addClass("successed");
            mcResp.removeClass("errored").addClass("successed");
            Self.find("input").val("");

            mcResp.find("p").fadeOut(10000);
          }
          if (resp.result === "error") {
            Self.removeClass("successed").addClass("errored");
            mcResp.removeClass("successed").addClass("errored");
            Self.find("input").val("");

            mcResp.find("p").fadeOut(10000);
          }
        },
      });
    });
  }

  if ($(".video-popup").length) {
    $(".video-popup").magnificPopup({
      type: "iframe",
      mainClass: "mfp-fade",
      removalDelay: 160,
      preloader: true,

      fixedContentPos: false,
    });
  }

  if ($(".img-popup").length) {
    var groups = {};
    $(".img-popup").each(function () {
      var id = parseInt($(this).attr("data-group"), 10);

      if (!groups[id]) {
        groups[id] = [];
      }

      groups[id].push(this);
    });

    $.each(groups, function () {
      $(this).magnificPopup({
        type: "image",
        closeOnContentClick: true,
        closeBtnInside: false,
        gallery: {
          enabled: true,
        },
      });
    });
  }

  function dynamicCurrentMenuClass(selector) {
    let FileName = window.location.href.split("/").reverse()[0];

    selector.find("li").each(function () {
      let anchor = $(this).find("a");
      if ($(anchor).attr("href") == FileName) {
        $(this).addClass("current");
      }
    });
    // if any li has .current elmnt add class
    selector.children("li").each(function () {
      if ($(this).find(".current").length) {
        $(this).addClass("current");
      }
    });
    // if no file name return
    if ("" == FileName) {
      selector.find("li").eq(0).addClass("current");
    }
  }

  if ($(".main-menu__list").length) {
    // dynamic current class
    let mainNavUL = $(".main-menu__list");
    dynamicCurrentMenuClass(mainNavUL);
  }
  if ($(".services-details__services").length) {
    // dynamic current class
    let mainNavUL = $(".services-details__services");
    dynamicCurrentMenuClass(mainNavUL);
  }

  if ($(".main-menu__nav").length && $(".mobile-nav__container").length) {
    let navContent = document.querySelector(".main-menu__nav").innerHTML;
    let mobileNavContainer = document.querySelector(".mobile-nav__container");
    mobileNavContainer.innerHTML = navContent;
  }
  if ($(".sticky-header__content").length) {
    let navContent = document.querySelector(".main-menu").innerHTML;
    let mobileNavContainer = document.querySelector(".sticky-header__content");
    mobileNavContainer.innerHTML = navContent;
  }

  if ($(".mobile-nav__container .main-menu__list").length) {
    let dropdownAnchor = $(
      ".mobile-nav__container .main-menu__list .dropdown > a"
    );
    dropdownAnchor.each(function () {
      let self = $(this);
      let toggleBtn = document.createElement("BUTTON");
      toggleBtn.setAttribute("aria-label", "dropdown toggler");
      toggleBtn.innerHTML = "<i class='fa fa-angle-down'></i>";
      self.append(function () {
        return toggleBtn;
      });
      self.find("button").on("click", function (e) {
        e.preventDefault();
        let self = $(this);
        self.toggleClass("expanded");
        self.parent().toggleClass("expanded");
        self.parent().parent().children("ul").slideToggle();
      });
    });
  }

  if ($(".mobile-nav__toggler").length) {
    $(".mobile-nav__toggler").on("click", function (e) {
      e.preventDefault();
      $(".mobile-nav__wrapper").toggleClass("expanded");
      $("body").toggleClass("locked");
    });
  }

  if ($(".search-toggler").length) {
    $(".search-toggler").on("click", function (e) {
      e.preventDefault();
      $(".search-popup").toggleClass("active");
      $(".mobile-nav__wrapper").removeClass("expanded");
      $("body").toggleClass("locked");
    });
  }
  if ($(".mini-cart__toggler").length) {
    $(".mini-cart__toggler").on("click", function (e) {
      e.preventDefault();
      $(".mini-cart").toggleClass("expanded");
      $(".mobile-nav__wrapper").removeClass("expanded");
      $("body").toggleClass("locked");
    });
  }
  if ($(".odometer").length && $.fn.appear) {
    $(".odometer").appear(function (e) {
      var odo = $(".odometer");
      odo.each(function () {
        var countNumber = $(this).attr("data-count");
        $(this).html(countNumber);
      });
    });
  }

  if ($(".dynamic-year").length) {
    let date = new Date();
    $(".dynamic-year").html(date.getFullYear());
  }

  if ($(".wow").length) {
    var wow = new WOW({
      boxClass: "wow", // animated element css class (default is wow)
      animateClass: "animated", // animation css class (default is animated)
      mobile: true, // trigger animations on mobile devices (default is true)
      live: true, // act on asynchronously loaded content (default is true)
    });
    wow.init();
  }

  if ($("#donate-amount__predefined").length) {
    let donateInput = $("#donate-amount");
    $("#donate-amount__predefined")
      .find("li")
      .on("click", function (e) {
        e.preventDefault();
        let amount = $(this).find("a").text();
        donateInput.val(amount);
        $("#donate-amount__predefined").find("li").removeClass("active");
        $(this).addClass("active");
      });
  }

  //Accordian
  if ($(".faq-page__accrodion").length) {
    var accrodionGrp = $(".faq-page__accrodion");
    accrodionGrp.each(function () {
      var accrodionName = $(this).data("grp-name");
      var Self = $(this);
      var accordion = Self.find(".accrodion");
      Self.addClass(accrodionName);
      Self.find(".accrodion .accrodion-content").hide();
      Self.find(".accrodion.active").find(".accrodion-content").show();
      accordion.each(function () {
        $(this)
          .find(".accrodion-title")
          .on("click", function () {
            if ($(this).parent().hasClass("active") === false) {
              $(".faq-page__accrodion." + accrodionName)
                .find(".accrodion")
                .removeClass("active");
              $(".faq-page__accrodion." + accrodionName)
                .find(".accrodion")
                .find(".accrodion-content")
                .slideUp();
              $(this).parent().addClass("active");
              $(this).parent().find(".accrodion-content").slideDown();
            }
          });
      });
    });
  }

  //Pricing Tabs
  if ($(".tabs-box").length) {
    $(".tabs-box .tab-buttons .tab-btn").on("click", function (e) {
      e.preventDefault();
      var target = $($(this).attr("data-tab"));

      if ($(target).is(":visible")) {
        return false;
      } else {
        target
          .parents(".tabs-box")
          .find(".tab-buttons")
          .find(".tab-btn")
          .removeClass("active-btn");
        $(this).addClass("active-btn");
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .fadeOut(0);
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .removeClass("active-tab");
        $(target).fadeIn(300);
        $(target).addClass("active-tab");
      }
    });
  }

  /*-- Quantity --*/
  $(".add").on("click", function () {
    if ($(this).prev().val() < 999) {
      $(this)
        .prev()
        .val(+$(this).prev().val() + 1);
    }
  });
  $(".sub").on("click", function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1)
        $(this)
        .next()
        .val(+$(this).next().val() - 1);
    }
  });

  /*-- Price Range --*/
  function priceFilter() {
    if ($(".price-ranger").length) {
      $(".price-ranger #slider-range").slider({
        range: true,
        min: 50,
        max: 1000,
        values: [11, 500],
        slide: function (event, ui) {
          $(".price-ranger .ranger-min-max-block .min").val("$" + ui.values[0]);
          $(".price-ranger .ranger-min-max-block .max").val("$" + ui.values[1]);
        }
      });
      $(".price-ranger .ranger-min-max-block .min").val(
        "$" + $(".price-ranger #slider-range").slider("values", 0)
      );
      $(".price-ranger .ranger-min-max-block .max").val(
        "$" + $(".price-ranger #slider-range").slider("values", 1)
      );
    }
  }

  /*-- Checkout Accoradin --*/
  if ($(".checkout-page__payment__title").length) {
    $(".checkout-page__payment__item").find(".checkout-page__payment__content").hide();
    $(".checkout-page__payment__item--active")
      .find(".checkout-page__payment__content")
      .show();
    $(".checkout-page__payment__title").on("click", function (e) {
      e.preventDefault();
      $(this)
        .parents(".checkout-page__payment")
        .find(".checkout-page__payment__item")
        .removeClass("checkout-page__payment__item--active");
      $(this)
        .parents(".checkout-page__payment")
        .find(".checkout-page__payment__content")
        .slideUp();
      $(this).parent().addClass("checkout-page__payment__item--active");
      $(this).parent().find(".checkout-page__payment__content").slideDown();
    });
  }

  let thmOwlCarousels = $(".ogency-owl__carousel");
  if (thmOwlCarousels.length) {
    thmOwlCarousels.each(function () {
      let elm = $(this);
      let options = elm.data("owl-options");
      let thmOwlCarousel = elm.owlCarousel(
        "object" === typeof options ? options : JSON.parse(options)
      );
    });
  }

  function thmTinyInit() {
    // tiny slider
    const tinyElm = document.querySelectorAll(".ogency-tiny__slider");
    tinyElm.forEach(function (tinyElm) {
      const tinyOptions = JSON.parse(tinyElm.dataset.tinyOptions);
      let thmTinySlider = tns(tinyOptions);
    });
  }

  // window load event
  $(window).on("load", function () {
    thmTinyInit();
    galleryMasonaryLayout();
    priceFilter();

    if ($(".circle-progress").length && $.fn.appear) {
      $(".circle-progress").appear(function () {
        let circleProgress = $(".circle-progress");
        circleProgress.each(function () {
          let progress = $(this);
          let progressOptions = progress.data("options");
          progress.circleProgress(progressOptions);
        });
      });
    }

    // === Gallery Masnry===
    function galleryMasonaryLayout() {
      if ($(".masonary-layout").length) {
        $(".masonary-layout").isotope({
          layoutMode: "masonry"
        });
      }
      if ($(".post-filter").length) {
        $(".post-filter li")
          .children(".filter-text")
          .on("click", function () {
            var Self = $(this);
            var selector = Self.parent().attr("data-filter");
            $(".post-filter li").removeClass("active");
            Self.parent().addClass("active");
            $(".filter-layout").isotope({
              filter: selector,
              animationOptions: {
                duration: 500,
                easing: "linear",
                queue: false
              }
            });
            return false;
          });
      }

      if ($(".post-filter.has-dynamic-filters-counter").length) {
        // var allItem = $('.single-filter-item').length;
        var activeFilterItem = $(".post-filter.has-dynamic-filters-counter").find(
          "li"
        );
        activeFilterItem.each(function () {
          var filterElement = $(this).data("filter");
          var count = $(".filter-layout").find(filterElement).length;
          $(this)
            .children(".filter-text")
            .append('<span class="count">' + count + "</span>");
        });
      }
    }

    if ($(".curved-circle--item").length) {
      $(".curved-circle--item").circleType({
        radius: 70,
        forceHeight: true,
        forceWidth: true
      });
    }
    if ($(".curved-circle-item").length) {
      $(".curved-circle-item").circleType({
        radius: 90,
        forceHeight: true,
        forceWidth: true
      });
    }
    if ($(".curved-circle---item").length) {
      $(".curved-circle---item").circleType({
        radius: 75,
        forceHeight: true,
        forceWidth: true
      });
    }
  });

  // window scroll event
  $(window).on("scroll", function () {
    if ($(".stricked-menu").length) {
      var headerScrollPos = 130;
      var stricky = $(".stricked-menu");
      if ($(window).scrollTop() > headerScrollPos) {
        stricky.addClass("stricky-fixed");
      } else if ($(this).scrollTop() <= headerScrollPos) {
        stricky.removeClass("stricky-fixed");
      }
    }
    OnePageMenuScroll();
  });

  // custom coursor
  if ($(".custom-cursor").length) {
    var cursor = document.querySelector(".custom-cursor__cursor");
    var cursorinner = document.querySelector(".custom-cursor__cursor-two");
    var a = document.querySelectorAll("a");

    document.addEventListener("mousemove", function (e) {
      var x = e.clientX;
      var y = e.clientY;
      cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    });

    document.addEventListener("mousemove", function (e) {
      var x = e.clientX;
      var y = e.clientY;
      cursorinner.style.left = x + "px";
      cursorinner.style.top = y + "px";
    });

    document.addEventListener("mousedown", function () {
      cursor.classList.add("click");
      cursorinner.classList.add("custom-cursor__innerhover");
    });

    document.addEventListener("mouseup", function () {
      cursor.classList.remove("click");
      cursorinner.classList.remove("custom-cursor__innerhover");
    });

    a.forEach((item) => {
      item.addEventListener("mouseover", () => {
        cursor.classList.add("custom-cursor__hover");
      });
      item.addEventListener("mouseleave", () => {
        cursor.classList.remove("custom-cursor__hover");
      });
    });
  }

  /*-- Text Sliding --*/
  let parent = document.querySelectorAll('.slider-text-one__animate-text');
  for (let i = 0; i < parent.length; i++) {
    parent[i].style.width = parent[i].children[0].clientWidth + "px";
  };

  // Popular Causes Progress Bar
  if ($(".count-bar").length && $.fn.appear) {
    $(".count-bar").appear(
      function () {
        var el = $(this);
        var percent = el.data("percent");
        $(el).css("width", percent).addClass("counted");
      }, {
        accY: -50
      }
    );
  }

  //Fact Counter + Text Count
  if ($(".count-box").length && $.fn.appear) {
    $(".count-box").appear(
      function () {
        var $t = $(this),
          n = $t.find(".count-text").attr("data-stop"),
          r = parseInt($t.find(".count-text").attr("data-speed"), 10);

        if (!$t.hasClass("counted")) {
          $t.addClass("counted");
          $({
            countNum: $t.find(".count-text").text()
          }).animate({
            countNum: n
          }, {
            duration: r,
            easing: "linear",
            step: function () {
              $t.find(".count-text").text(Math.floor(this.countNum));
            },
            complete: function () {
              $t.find(".count-text").text(this.countNum);
            }
          });
        }
      }, {
        accY: 0
      }
    );
  }
  /*-- Typing Animation --*/
  var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
  };
  TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '<span class="wrap-border"></span></span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) {
      delta /= 2;
    }
    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    setTimeout(function () {
      that.tick();
    }, delta);
  };
  window.onload = function () {
    var elements = document.getElementsByClassName('typewrite');
    for (var i = 0; i < elements.length; i++) {
      var toRotate = elements[i].getAttribute('data-type');
      var period = elements[i].getAttribute('data-period');
      if (toRotate) {
        new TxtType(elements[i], JSON.parse(toRotate), period);
      }
    }
  };

  //Strech Column
  /*$(window).on("resize", function () {
    ogency_stretch();
  });*/
  ogency_stretch();

  function ogency_stretch() {
    var i = $(window).width();
    $(".row .ogency-stretch-element-inside-column").each(function () {
      var $this = $(this),
        row = $this.closest(".row"),
        cols = $this.closest('[class^="col-"]'),
        colsheight = $this.closest('[class^="col-"]').height(),
        rect = this.getBoundingClientRect(),
        l = row[0].getBoundingClientRect(),
        s = cols[0].getBoundingClientRect(),
        r = rect.left,
        d = i - rect.right,
        c = l.left + (parseFloat(row.css("padding-left")) || 0),
        u = i - l.right + (parseFloat(row.css("padding-right")) || 0),
        p = s.left,
        f = i - s.right,
        styles = {
          "margin-left": 0,
          "margin-right": 0
        };
      if (Math.round(c) === Math.round(p)) {
        var h = parseFloat($this.css("margin-left") || 0);
        styles["margin-left"] = h - r;
      }
      if (Math.round(u) === Math.round(f)) {
        var w = parseFloat($this.css("margin-right") || 0);
        styles["margin-right"] = w - d;
      }
      $this.css(styles);
    });
  }
  /*-- Back-to-top --*/
  $(document).ready(function () {
    var e = document.querySelector(".scroll-top path"),
      t = e.getTotalLength();
    (e.style.transition = e.style.WebkitTransition = "none"),
    (e.style.strokeDasharray = t + " " + t),
    (e.style.strokeDashoffset = t),
    e.getBoundingClientRect(),
      (e.style.transition = e.style.WebkitTransition = "stroke-dashoffset 10ms linear");
    var o = function () {
      var o = $(window).scrollTop(),
        r = $(document).height() - $(window).height(),
        i = t - (o * t) / r;
      e.style.strokeDashoffset = i;
    };
    o(), $(window).scroll(o);
    var back = $(".scroll-top"),
      body = $("body, html");
    $(window).on('scroll', function () {
      if ($(window).scrollTop() > $(window).height()) {
        back.addClass('scroll-top--active');
      } else {
        back.removeClass('scroll-top--active');
      }
    });
  });

  /*-- Project Hover Image --*/
  const link = document.querySelectorAll('.project-one__item');
  const linkHoverReveal = document.querySelectorAll('.project-one__item__hover');
  const linkImages = document.querySelectorAll('.project-one__item__hover--img');
  for (let i = 0; i < link.length; i++) {
    link[i].addEventListener('mousemove', (e) => {
      linkHoverReveal[i].style.opacity = 1;
      linkHoverReveal[i].style.transform = `translate(-100%, -50% ) rotate(5deg)`;
      linkImages[i].style.transform = 'scale(1, 1)';
      linkHoverReveal[i].style.left = e.clientX + "px";
    })
    link[i].addEventListener('mouseleave', (e) => {
      linkHoverReveal[i].style.opacity = 0;
      linkHoverReveal[i].style.transform = `translate(-50%, -50%) rotate(-5deg)`;
      linkImages[i].style.transform = 'scale(0.8, 0.8)';
    })
  }
  /*-- One Page Menu --*/
  function SmoothMenuScroll() {
    var anchor = $(".scrollToLink");
    if (anchor.length) {
      anchor.children("a").bind("click", function (event) {
        if ($(window).scrollTop() > 10) {
          var headerH = "90";
        } else {
          var headerH = "90";
        }
        var target = $(this);
        $("html, body")
          .stop()
          .animate({
              scrollTop: $(target.attr("href")).offset().top - headerH + "px"
            },
            1200,
            "easeInOutExpo"
          );
        anchor.removeClass("current");
        anchor.removeClass("current-menu-ancestor");
        anchor.removeClass("current_page_item");
        anchor.removeClass("current-menu-parent");
        target.parent().addClass("current");
        event.preventDefault();
      });
    }
  }
  SmoothMenuScroll();

  function OnePageMenuScroll() {
    var windscroll = $(window).scrollTop();
    if (windscroll >= 117) {
      var menuAnchor = $(".one-page-scroll-menu .scrollToLink").children("a");
      menuAnchor.each(function () {
        var sections = $(this).attr("href");
        $(sections).each(function () {
          if ($(this).offset().top <= windscroll + 100) {
            var Sectionid = $(sections).attr("id");
            $(".one-page-scroll-menu").find("li").removeClass("current");
            $(".one-page-scroll-menu")
              .find("li")
              .removeClass("current-menu-ancestor");
            $(".one-page-scroll-menu")
              .find("li")
              .removeClass("current_page_item");
            $(".one-page-scroll-menu")
              .find("li")
              .removeClass("current-menu-parent");
            $(".one-page-scroll-menu")
              .find("a[href*=\\#" + Sectionid + "]")
              .parent()
              .addClass("current");
          }
        });
      });
    } else {
      $(".one-page-scroll-menu li.current").removeClass("current");
      $(".one-page-scroll-menu li:first").addClass("current");
    }
  }

  /*-- Dynamic year --*/
  if ($(".dynamic-year").length) {
    let currentYear = new Date().getFullYear();
    $(".dynamic-year").html(currentYear);
  }

  // Project Scroll Animation
  if ($(".project-scroll").length) {
    const projectItems = $(".project-scroll__item");
    const totalItems = projectItems.length;

    $(window).on("scroll", function() {
      const scrollTop = $(window).scrollTop();
      const windowHeight = $(window).height();

      // Find which item should be active based on scroll position
      let activeIndex = -1;
      
      projectItems.each(function(index) {
        const item = $(this);
        const itemTop = item.offset().top;
        const itemBottom = itemTop + item.height();
        
        // Check if this item is the most centered in viewport
        const itemCenter = itemTop + (item.height() / 2);
        const viewportCenter = scrollTop + (windowHeight / 2);
        const distance = Math.abs(itemCenter - viewportCenter);
        
        if (activeIndex === -1 || distance < Math.abs(
          $(projectItems[activeIndex]).offset().top + ($(projectItems[activeIndex]).height() / 2) - viewportCenter
        )) {
          activeIndex = index;
        }
      });

      // Apply active state with perfect hand-off
      projectItems.each(function(index) {
        const item = $(this);
        const itemTop = item.offset().top;
        const itemBottom = itemTop + item.height();
        
        if (index === activeIndex) {
          // This is the active item - make sure it's visible
          item.addClass("active");
        } else if (index < activeIndex) {
          // Previous items - only hide if next item is mostly visible
          const nextItem = $(projectItems[index + 1]);
          if (nextItem.length) {
            const nextTop = nextItem.offset().top;
            const nextBottom = nextTop + nextItem.height();
            if (scrollTop + windowHeight * 0.6 > nextTop) {
              // Next item is mostly visible, hide this one
              item.removeClass("active");
            } else {
              // Next item not visible enough, keep this one visible
              item.addClass("active");
            }
          } else {
            // No next item, keep this one visible
            item.addClass("active");
          }
        } else if (index > activeIndex) {
          // Future items - only show if current item is mostly scrolled past
          const prevItem = $(projectItems[index - 1]);
          if (prevItem.length) {
            const prevTop = prevItem.offset().top;
            if (scrollTop + windowHeight * 0.4 > prevTop) {
              // Previous item is mostly scrolled past, show this one
              item.addClass("active");
            } else {
              // Previous item still dominant, keep this one hidden
              item.removeClass("active");
            }
          } else {
            // No previous item, show this one
            item.addClass("active");
          }
        }
      });
    });
  }

  // Modern Testimonial Carousel
  function initTestimonialCarousel() {
    const carousel = $('#testimonial-modern__carousel');
    const cards = carousel.find('.testimonial-card');
    const dots = $('#testimonial-dots .dot');
    const prevBtn = $('#testimonial-prev');
    const nextBtn = $('#testimonial-next');
    
    let currentIndex = 0;
    let autoplayInterval;
    
    function showCard(index) {
      // Hide all cards
      cards.removeClass('active');
      dots.removeClass('active');
      
      // Show current card with animation
      setTimeout(() => {
        cards.eq(index).addClass('active');
        dots.eq(index).addClass('active');
      }, 50);
      
      currentIndex = index;
    }
    
    function nextCard() {
      const nextIndex = (currentIndex + 1) % cards.length;
      showCard(nextIndex);
    }
    
    function prevCard() {
      const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
      showCard(prevIndex);
    }
    
    function startAutoplay() {
      autoplayInterval = setInterval(nextCard, 5000);
    }
    
    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }
    
    // Navigation button events
    prevBtn.on('click', () => {
      prevCard();
      stopAutoplay();
      startAutoplay();
    });
    
    nextBtn.on('click', () => {
      nextCard();
      stopAutoplay();
      startAutoplay();
    });
    
    // Dot navigation
    dots.on('click', function() {
      const index = $(this).data('slide');
      showCard(index);
      stopAutoplay();
      startAutoplay();
    });
    
    // Pause on hover
    carousel.on('mouseenter', stopAutoplay);
    carousel.on('mouseleave', startAutoplay);
    
    // Initialize first card and start autoplay
    showCard(0);
    startAutoplay();
    
    // Keyboard navigation
    $(document).on('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevCard();
        stopAutoplay();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextCard();
        stopAutoplay();
        startAutoplay();
      }
    });
  }

// Initialize testimonial carousel when DOM is ready
if ($('#testimonial-modern__carousel').length) {
initTestimonialCarousel();
}

// How We Work Timeline Scroll Animation
function initTimelineAnimation() {
const timelineItems = $('.how-we-work__item');
const timelineLine = $('.how-we-work__line');
const timeline = $('.how-we-work__timeline');
const svgPath = timelineLine.find('path');
  
if (timelineItems.length === 0) return;
  
// Function to check if element is in viewport
function isInViewport(element) {
const rect = element[0].getBoundingClientRect();
const windowHeight = $(window).height();
const windowTop = $(window).scrollTop();
const elementTop = element.offset().top;
  
// Trigger when element is 20% visible from bottom
return (elementTop - windowTop) < (windowHeight * 0.8);
}

// Function to update SVG path drawing based on scroll
function updatePathDrawing() {
if (!isInViewport(timeline)) return;
  
let maxVisibleIndex = -1;
const timelineHeight = timeline.height();
const itemHeight = timelineHeight / timelineItems.length;
  
// Find the furthest visible item
timelineItems.each(function(index) {
const item = $(this);
if (isInViewport(item)) {
maxVisibleIndex = index;
}
});

// Calculate path length based on visible items
if (maxVisibleIndex >= 0) {
// Calculate how much of the path should be drawn
const totalPathLength = 1000; // Total stroke-dasharray value
const itemsCount = timelineItems.length;
const visibleItems = maxVisibleIndex + 1;
  
// Calculate the percentage of path to draw
const pathPercentage = (visibleItems / itemsCount);
const pathLength = totalPathLength * pathPercentage;
  
// Apply the stroke-dashoffset for progressive drawing
svgPath.css({
'stroke-dashoffset': totalPathLength - pathLength,
'transition': 'stroke-dashoffset 0.5s ease-out'
});

// Update line height for clipping
const targetHeight = ((maxVisibleIndex + 1) * itemHeight) + (itemHeight / 2);
const percentageHeight = (targetHeight / timelineHeight) * 100;
  
timelineLine.css({
'height': percentageHeight + '%',
'transition': 'height 0.5s ease-out'
});
}
}

// Function to animate individual items
function animateTimelineItems() {
timelineItems.each(function(index) {
const item = $(this);
if (isInViewport(item) && !item.hasClass('animated')) {
// Add animation class with staggered delay
setTimeout(function() {
item.addClass('animated');
}, index * 200);
}
});
}

// Initialize path with full dash offset (hidden)
svgPath.css('stroke-dashoffset', 1000);
  
// Initial check on page load
updatePathDrawing();
animateTimelineItems();
  
// Check on scroll
$(window).on('scroll', function() {
updatePathDrawing();
animateTimelineItems();
});
  
// Also update on resize for responsive behavior
$(window).on('resize', function() {
updatePathDrawing();
});
}

// Initialize timeline animation when DOM is ready
if ($('.how-we-work__timeline').length) {
initTimelineAnimation();
}

})(jQuery);