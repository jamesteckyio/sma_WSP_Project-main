import { getData } from './utilities/get_data.js'
import { check_page_status, each_page_show, pagination, current_page } from './utilities/pagination.js'
import { search_ftn, search, sort_by_item, sort_by } from'./utilities/search.js';
import { order_by, order_by_ascending } from './utilities/order_by.js'

let users_table = document.querySelector('#users_table')

let data = {};
let data_in_table = [];

let path = window.location.pathname
if(path === '/admin') {
  document.querySelectorAll('.form-control').forEach(item => {
    item.addEventListener('change',() => {
        let rUserName = document.querySelector('#rUserName').value
        let email = document.querySelector('#email').value
        let rPassWord = document.querySelector('#rPassWord').value
        let cfmRPassWord = document.querySelector('#cfmRPassWord').value
        let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/
        
        if (rUserName !== '' && email !== '' && rPassWord !== '' && cfmRPassWord !== '') {
          // validation for password
          if (!regex.test(rPassWord)) {
            document.querySelector('#warn_notice').textContent = "Password must be at 4 characters, as least one number, one capital letter, one lower case letter"
          } else {
            // two passwords matching
            if (rPassWord !== cfmRPassWord) {
              document.querySelector('#warn_notice').textContent = "Two passwords are not match!"
              return
            } else {
              document.querySelector('#submit_btn').removeAttribute('disabled')
              document.querySelector('#warn_notice').textContent = ''
            }
          }
        } else {
          document.querySelector('#submit_btn').setAttribute('disabled','')
          document.querySelector('#warn_notice').textContent = 'Fill in all the information!'
        }
      })
  })

  document.querySelector('#reset_btn').addEventListener('click', () => {
    document.querySelector('#rUserName').value = ''
    document.querySelector('#email').value = ''
    document.querySelector('#rPassWord').value = ''
    document.querySelector('#cfmRPassWord').value = ''
    document.querySelector('#warn_notice').textContent = ''
    document.querySelector('#submit_btn').setAttribute('disabled','')
  })

  document.querySelectorAll('.form-control').forEach(item => {
    item.addEventListener('change',() => {
        let newPassword = document.querySelector('#newPassword').value
        let cfmNewPassword = document.querySelector('#cfmNewPassword').value
        let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/
        if (newPassword !== '' && cfmNewPassword !== '') {
          if (!regex.test(newPassword)) {
            document.querySelector('#warn_notice_change_pw').textContent = "Password must be at 4 characters, as least one number, one capital letter, one lower case letter"
          } else {
            if(newPassword !== cfmNewPassword) {
              document.querySelector('#warn_notice_change_pw').textContent = 'Two password are not match!'
              return
            } else {
              document.querySelector('#submit_btn_change_pw').removeAttribute('disabled')
              document.querySelector('#warn_notice_change_pw').textContent = ''
            }
          }
        } else {
          document.querySelector('#submit_btn_change_pw').setAttribute('disabled','')
          document.querySelector('#warn_notice_change_pw').textContent = 'Fill in all the information!'
        }
      })
  })

  document.querySelector('#reset_btn_change_pw').addEventListener('click', () => {
    document.querySelector('#id_change_pw').value = ''
    document.querySelector('#newPassword').value = ''
    document.querySelector('#cfmNewPassword').value = ''
    document.querySelector('#warn_notice_change_pw').textContent = ''
    document.querySelector('#submit_btn_change_pw').setAttribute('disabled','')
  })
}

// add new data
document
	.querySelector('#regisForm')
	?.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		let rUserName = form.rUserName.value
    let email = form.email.value
		let rPassWord = form.rPassWord.value

		const res = await fetch('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: rUserName,
        email:email,
				password: rPassWord
			})
		})
		const result = await res.json()

		document.querySelector('#rUserName').value = ''
		document.querySelector('#rPassWord').value = ''
		document.querySelector('#cfmRPassWord').value = ''

    loadUsersTable()
	})

// for change password
document
	.querySelector('#changePwForm')
	?.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		let newPassWord = form.newPassword.value

    const res = await fetch(`/users_list${form.id_change_pw.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        changePw: true,
        id: form.id_change_pw.value,
        password:newPassWord
      })
    })
    const result = await res.json()

    document.querySelector('#id_change_pw').value = ''
    document.querySelector('#newPassword').value = ''
    document.querySelector('#cfmNewPassword').value = ''

    loadUsersTable()
	})

const loadUsersTable = async () => {
  try {
    if (window.location.pathname === '/admin') {
      data = await getData(`users_list?page=${current_page}&limit=${each_page_show}&order_by=${order_by}&order_by_ascending=${order_by_ascending}&sort_by_item=${sort_by_item}&sort_by=${sort_by}`)
  
      let start = (current_page - 1) * each_page_show
      let end = start + each_page_show
      
      data_in_table = data.data?.slice(start, end)
  
      pagination(data.no_of_page)
      check_page_status(data)
      search_ftn(data)

      if(search(data.data, sort_by_item, sort_by).length !== 0) {
        data_in_table = search(data.data, sort_by_item, sort_by)
      } else if (sort_by_item) {
        data.data = []
      } else {
        ''
      }
      // generate table
      if(data.data?.length === undefined || data.data?.length === 0 ) {
        let no_of_col = document.querySelectorAll('th').length
        users_table.innerHTML = ''
        users_table.innerHTML = `<tr><th class="text-center" colspan=${no_of_col}>No DATA</th></tr>`
      } else {
        users_table.innerHTML = ''
        data_in_table.forEach( user => {
          users_table.innerHTML += `<tr id=${user.id}><th scope="row">${user.id}</th>
          <td><input disabled type='text' data-username="${user.id}" value=${user.username}></td>
          <td><input disabled type='text' data-email="${user.id}" value=${user.email}></td>
          <td><input disabled type='text' data-is-admin="${user.id}" value=${user.is_admin}></td>
          <td>
            <button data-bs-toggle="modal" data-bs-target="#changeModal" data-change="${user.id}">Change</button>
          </td>
          <td>
            <button data-upgrade="${user.id}" ${user.is_admin?'disabled':''}>Upgrade</button>
          </td>
          <td>
            <button data-edit="${user.id}">Edit</button>
            <button data-done="${user.id}" class="hide">Done</button>
            <button data-cancel="${user.id}" class="hide">Cancel</button>
          </td>
          <td>
          <button data-delete=${user.id}>Delete</button>
          </td>
          </tr>`
        })
      }
      // controller for the and delete btn
      document.querySelectorAll('[data-change]')?.forEach(change => {
        if (window.sessionStorage.getItem('admin')) {
          change.addEventListener('click', (e) => {
            document.querySelector('#id_change_pw').value = e.target.getAttribute('data-change')
          })
        }
      })
  
      document.querySelectorAll('[data-upgrade]')?.forEach(upgrade => {
        upgrade.addEventListener('click', async (e) => {
          const targetId = e.target.getAttribute('data-upgrade')
  
          const res = await fetch(`/users_list${targetId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              upgradeAdmin: true,
              id: targetId,
              is_admin:true
            })
          })
          const result = await res.json()
      
          document.querySelector('#id_change_pw').value = ''
          document.querySelector('#newPassword').value = ''
          document.querySelector('#cfmNewPassword').value = ''
      
          loadUsersTable()
        })
      })
  
      document.querySelectorAll('[data-edit]')?.forEach(edit => {
        if (window.sessionStorage.getItem('admin')) {
          edit.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-edit')
            document.querySelector(`[data-username="${target}"]`).removeAttribute("disabled")
            document.querySelector(`[data-email="${target}"]`).removeAttribute("disabled")
            document.querySelector(`[data-done="${target}"]`).classList.remove('hide')
            document.querySelector(`[data-cancel="${target}"]`).classList.remove('hide')
            document.querySelector(`[data-edit="${target}"]`).classList.add('hide')
          })
        } else {
          edit.addEventListener('click', () => {
            alert('Please Find Admin!')
          })
        }
      })
      document.querySelectorAll('[data-delete]')?.forEach(del => {
        if (window.sessionStorage.getItem('admin')) {
          del.addEventListener('click', (e) => {
            delFtn(e)
          })
        } else {
          del.addEventListener('click', () => {
            alert('Please Find Admin!')
          })
        }
      })
      document.querySelectorAll('[data-done]')?.forEach(done => {
        done.addEventListener('click', (e) => {
          editFtn(e)
          const target = e.target.getAttribute('data-done')
          document.querySelector(`[data-username="${target}"]`).setAttribute("disabled","")
          document.querySelector(`[data-email="${target}"]`).setAttribute("disabled","")
          document.querySelector(`[data-done="${target}"]`).classList.add('hide')
          document.querySelector(`[data-cancel="${target}"]`).classList.add('hide')
          document.querySelector(`[data-edit="${target}"]`).classList.remove('hide')
        })
      })
      document.querySelectorAll('[data-cancel]')?.forEach(cancel => {
        cancel.addEventListener('click', (e) => {
          const target = e.target.getAttribute('data-cancel')
          document.querySelector(`[data-username="${target}"]`).setAttribute("disabled","")
          document.querySelector(`[data-email="${target}"]`).setAttribute("disabled","")
          document.querySelector(`[data-done="${target}"]`).classList.add('hide')
          document.querySelector(`[data-cancel="${target}"]`).classList.add('hide')
          document.querySelector(`[data-edit="${target}"]`).classList.remove('hide')
        })
      })

      search_ftn(data)
    }
  } catch (e) {
    console.log(e)
  }
}

const delFtn = async (e) => {
  await fetch(`/users_list${e.target.getAttribute('data-delete')}`, {
    method: 'DELETE'
  })
  loadUsersTable()
}

const editFtn = async (e) => {
  const currentTarget = e.target.getAttribute('data-done')
  
  const username = document.querySelector(`[data-username="${currentTarget}"]`).value
  const email = document.querySelector(`[data-email="${currentTarget}"]`).value

  await fetch(`/users_list${e.target.getAttribute('data-done')}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      updateUser: true,
      id:currentTarget,
      username: username,
      email: email
    })
  })
  loadUsersTable()
}

document.querySelector('#rpw_visibility')?.addEventListener('click',() => {
  let pw = document.querySelector('#rPassWord')
  console.log(pw.type)
  if(pw.type === "password") {
    document.querySelector('#rpw_visibility').textContent = 'visibility_off'
    pw.type = "text"
  } else {
    document.querySelector('#rpw_visibility').textContent = 'visibility'
    pw.type = "password"
  }
})

document.querySelector('#cfmRpw_visibility')?.addEventListener('click',() => {
  let pw = document.querySelector('#cfmRPassWord')
  console.log(pw.type)
  if(pw.type === "password") {
    document.querySelector('#cfmRpw_visibility').textContent = 'visibility_off'
    pw.type = "text"
  } else {
    document.querySelector('#cfmRpw_visibility').textContent = 'visibility'
    pw.type = "password"
  }
})

document.querySelector('#newpw_visibility')?.addEventListener('click',() => {
  let pw = document.querySelector('#newPassword')
  console.log(pw.type)
  if(pw.type === "password") {
    document.querySelector('#newpw_visibility').textContent = 'visibility_off'
    pw.type = "text"
  } else {
    document.querySelector('#newpw_visibility').textContent = 'visibility'
    pw.type = "password"
  }
})

document.querySelector('#cfmNewpw_visibility')?.addEventListener('click',() => {
  let pw = document.querySelector('#cfmNewPassword')
  console.log(pw.type)
  if(pw.type === "password") {
    document.querySelector('#cfmNewpw_visibility').textContent = 'visibility_off'
    pw.type = "text"
  } else {
    document.querySelector('#cfmNewpw_visibility').textContent = 'visibility'
    pw.type = "password"
  }
})

export { loadUsersTable }