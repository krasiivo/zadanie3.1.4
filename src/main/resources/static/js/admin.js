document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
});

//Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetch('/api/v1/users');
        if (!response.ok) {
            throw new Error('Ошибка сервера: ' + response.statusText);
        }
        const users = await response.json();
        renderUserTable(users);
    } catch (error) {
        handleFetchError(error);
    }
}

//Получение текущего пользователя
async function fetchCurrentUser() {
    const response = await fetch('/api/v1/user');
    if (response.ok) {
        const userData = await response.json();
        return userData.id;  // Где id - это идентификатор пользователя
    }
    throw new Error('Ошибка при получении текущего пользователя');
}

//Сохранение ID текущего пользователя
let currentUserId;

fetchCurrentUser()
    .then(id => {
        currentUserId = id;
        console.log(`Current User ID: ${currentUserId}`);
        loadUsers();
    })
    .catch(error => {
        console.error(error);
    });

//Добавление строк в таблицу
function renderUserTable(users) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach(user => {
        userTableBody.appendChild(createUserRow(user));
    });
}

//Создание строк таблицы
function createUserRow(user) {
    const row = document.createElement('tr');
    const isCurrentUser = user.id === currentUserId;

    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.age}</td>
        <td>${user.email}</td>
        <td>${user.roles ? user.roles.map(role => role.name).join(', ') : ''}</td>
        <td>
            <button class="btn btn-info"${isCurrentUser ? ' disabled' : ''} 
            style="${isCurrentUser ? 'background-color: grey; border-color: grey;' : ''}" 
            onclick="${isCurrentUser ? '' : `editUser(${user.id})`}">Edit</button>
        </td>
        <td>
            <button class="btn btn-danger"${isCurrentUser ? ' disabled' : ''} 
            style="${isCurrentUser ? 'background-color: grey; border-color: grey;' : ''}" 
            onclick="${isCurrentUser ? '' : `showDeleteModal(${user.id})`}">Delete</button>
        </td>
    `;
    return row;
}

//Обработка исключений
function handleFetchError(error) {
    console.error(error);
    showNotification(error.message);
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notification.style.backgroundColor = '#f8d7da';
    notification.style.color = '#721c24';
    notification.style.border = '1px solid #f5c6cb';
    notification.style.padding = '15px';
    notification.style.margin = '10px 0';
    notification.style.borderRadius = '5px';

    notificationContainer.appendChild(notification);

    // Удаление уведомления через 5 секунд
    setTimeout(() => {
        notificationContainer.removeChild(notification);
    }, 5000);
}

//Получение ролей из БД
async function loadRoles(apiUrl = '/api/v1/roles') {
    try {
        const rolesResponse = await fetch(apiUrl);

        if (!rolesResponse.ok) {
            throw new Error(`Ошибка ${rolesResponse.status}: ${rolesResponse.statusText}`);
        }

        return await rolesResponse.json();
    } catch (error) {
        console.error('Ошибка при загрузке ролей:', error.message);
        return [];
    }
}

//Отправка данных о пользователя для заполнения формы Edit
async function editUser(userId) {
    //Обработка исключений
    try {
        const response = await fetch(`/api/v1/users/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных пользователя');
        }
        const user = await response.json();
        document.getElementById('editID').value = user.id;
        document.getElementById('editUserID').value = user.id;
        document.getElementById('editName').value = user.username;
        document.getElementById('editAge').value = user.age;
        document.getElementById("editEmail").value = user.email;
        const allRoles = await loadRoles();

        const rolesSelect = document.getElementById('editRoles');
        rolesSelect.innerHTML = '';

        allRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            option.selected = user.roles && user.roles.some(userRole => userRole.id === role.id);
            rolesSelect.appendChild(option);
        });

        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    } catch (error) {
        console.error('Ошибка при извлечении пользователя:', error);
    }
}

document.getElementById('editUserForm').addEventListener('submit', async (event) => {
    console.log('Форма отправлена');
    event.preventDefault();

    const userId = document.getElementById('editUserID').value;
    const userData = {
        username: document.getElementById('editName').value,
        age: parseInt(document.getElementById('editAge').value),
        email: document.getElementById("editEmail").value,
        password: document.getElementById('editPassword').value,
        roles: Array.from(document.getElementById('editRoles').selectedOptions).map(option => option.textContent)
    };

    console.log(userData)

    //Обработка исключений
    try {
        const response = await fetch(`/api/v1/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        let responseText = await response.text();
        console.log('Ответ:', responseText);

        if (!response.ok) {
            const invalidUser = JSON.parse(responseText)
            showErrorNotification(invalidUser.message);
            return;
        }

        const updatedUser = JSON.parse(responseText);
        console.log('Пользователь обнавлен:', updatedUser);
        await loadUsers();
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        if (editModal) {
            editModal.hide();
        }
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        showErrorNotification('Произошла ошибка при обновлении пользователя')
    }

    function showErrorNotification(message) {
        const errorDiv = document.getElementById('errorEditNotification');
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
});


async function showDeleteModal(userId) {
    try {
        const response = await fetch(`/api/v1/users/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных пользователя');
        }
        const user = await response.json();

        document.getElementById('deleteID').value = user.id;
        document.getElementById('deleteName').value = user.username;
        document.getElementById('deleteAge').value = user.age;
        document.getElementById("deleteEmail").value = user.email
        const rolesContainer = document.getElementById('deleteRoles');
        rolesContainer.innerHTML = '';
        user.roles.forEach(role => {
            const option = document.createElement('option');
            option.textContent = role.name;
            rolesContainer.appendChild(option);
        });


        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();

        document.getElementById('deleteChanges').onclick = async (event) => {
            event.preventDefault();
            await deleteUser(userId);
            deleteModal.hide();
        };
    } catch (error) {
        console.error('Ошибка при извлечении пользователя в момент удаления:', error);
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/v1/users/${userId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await loadUsers();
        } else {
            throw new Error('Не удалось удалить пользователя');
        }
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
    }
}

//Добавление пользователя
async function addUser() {

    const userData = {
        username: document.getElementById('inputName').value,
        age: parseInt(document.getElementById('inputAge').value),
        email: document.getElementById("inputEmail").value,
        password: document.getElementById('inputPassword').value,
        roles: Array.from(document.getElementById('inputRoles').selectedOptions).map(option => option.textContent)
    };

    console.log(userData)

    //Обработка исключений
    try {
        const response = await fetch(`/api/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        let responseText = await response.text();
        console.log('Ответ:', responseText);

        if (!response.ok) {
            const invalidUser = JSON.parse(responseText);
            showErrorNotification(invalidUser.message);
            return;
        }

        const newUser = JSON.parse(responseText);
        console.log('Пользователь добавлен:', newUser);
        await loadUsers();
        document.getElementById('addUserForm').reset();
        const allUsersTab = new bootstrap.Tab(document.getElementById('nav-home-tab'));
        allUsersTab.show();
    } catch (error) {
        console.error('Ошибка при добавлении пользователя:', error);
        showErrorNotification('Произошла ошибка при добавлении пользователя');
    }

    function showErrorNotification(message) {
        const errorDiv = document.getElementById('errorAddNotification');
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

async function initializeRoles() {
    const roles = await loadRoles();
    const rolesSelect = document.getElementById('inputRoles');
    rolesSelect.innerHTML = '';

    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        rolesSelect.appendChild(option);
    });
}

document.getElementById('addUserForm').addEventListener('submit', async (event) => {
    console.log('Данные с формы отправлены');
    event.preventDefault();
    await addUser();
});
document.addEventListener('DOMContentLoaded', initializeRoles);
