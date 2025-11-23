$('#getToken').click(() => {
  let id = $('#email').val();
  let pw = $('#password').val();
  $('#result').html('⏳ Generating token...');
  
  fetch('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, pass: pw })
  })
    .then(e => e.json())
    .then(e => {
      let res = e.loc || e.error;
      if (e.loc) {
        $('#result').html(`✅ <strong>Token Generated Successfully!</strong><br><br>${res}<br><br>📋 <span style="color: #00ff00;">Copy this token and use the checker below to verify it!</span>`);
      } else {
        $('#result').html(`❌ <strong>Error:</strong> ${res}`);
      }
    })
    .catch(err => {
      $('#result').html('❌ <strong>Error:</strong> Unable to connect to server');
      console.error(err);
    });
});

$('#checkToken').click(() => {
  let token = $('#tokenInput').val().trim();
  
  if (!token) {
    $('#tokenResult').html('❌ <strong>Error:</strong> Please enter a token');
    return;
  }
  
  $('#tokenResult').html('⏳ Verifying token...');
  
  fetch('/check-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  })
    .then(e => e.json())
    .then(e => {
      if (e.valid) {
        $('#tokenResult').html(`
          ✅ <strong style="color: #00ff00;">Token is Valid!</strong><br><br>
          📋 <strong>User Information:</strong><br>
          👤 Name: ${e.data.name}<br>
          🆔 ID: ${e.data.id}<br>
          📧 Email: ${e.data.email}
        `);
      } else {
        $('#tokenResult').html(`❌ <strong>Token is Invalid or Expired</strong><br><br>${e.error || 'Please generate a new token'}`);
      }
    })
    .catch(err => {
      $('#tokenResult').html('❌ <strong>Error:</strong> Unable to verify token');
      console.error(err);
    });
});
