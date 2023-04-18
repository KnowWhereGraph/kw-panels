var modals = document.getElementsByClassName('modal');
var hidden_modals = document.getElementsByClassName('modal-view');
var modalImage = $('img.modal-img-view');
var height;

for (var i=0; i < modals.length; i++) {
    modals[i].addEventListener('click', showModal(i));
    // change this to jquery
    // i think my previous pagination functions can help here
    // will come back to this
    /*$('.modal').click(function(){
        alert("I'm here");
    })*/
}

//Custom variation used for iframe pop up
$('.modal-js').click(function(e) {
    e.preventDefault();

    var modalObj = document.getElementsByClassName('modal-view-js')[0];
    $(document.body).css('overflow', 'hidden');
    modalObj.style.display = 'block';
    modalObj.style.height = '100%';
    setTimeout(function(){
        $('.modal-view');
        setTimeout(function(){
            modalObj.childNodes[1].style.marginTop = "10%";
        }, 1);
    }, 1);
})

function showModal(i) {
	console.log('show modal')
    return function(){
        $(document.body).css('overflow', 'hidden');
        hidden_modals[i].style.display = 'block';
        hidden_modals[i].style.height = '100%';
        setTimeout(function(){
            $('.modal-view');
            setTimeout(function(){
                hidden_modals[i].childNodes[1].style.marginTop = "10%";
                height = modalImage.innerHeight();
            }, 1);
        }, 1);
    }
}

// scroll wheel
$(document).ready(function () {
    $('#modal-image').bind('mousewheel', function (e) {
        if (e.originalEvent.wheelDelta /120 > 0) {
            $('.plus').trigger('click'); // scroll up
        } else {
            $('.minus').trigger('click'); // scroll down
        }
    })
});

$(".config-table-modal").click(function (e) {
    e.stopPropagation();
});
$('#modal-img').click(function (e) {
    e.stopPropagation();
})


$('.modal-view').click(closeModal);
$('.close').click(closeModal);
$(".modal-wrap, .modal-wrap a:not(.close), .modal-bio").click(function(e) {
        e.stopPropagation();
    });
$('.modal-close').click(closeModal);

function closeModal () {
    $(document.body).css('overflow', '');
    $(".config-table-modal").css('margin-top', '');
    $(".modal-wrap").css('margin-top', '');
    setTimeout(function(){
        $('.modal-view');
        setTimeout(function(){
            $(".modal-view").css('display', '');
            $(".modal-view").css('height', '');
        }, 150);
    }, 100);
}
