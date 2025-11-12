(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  });
})();
// 📅 Initialize date range picker
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#weekPicker")) {
    flatpickr("#weekPicker", {
      mode: "range",           // select start + end date
      dateFormat: "Y-m-d",     // output format
      altInput: true,          // show nice readable text
      altFormat: "M j, Y",
      minDate: "today"
    });
  }
});
