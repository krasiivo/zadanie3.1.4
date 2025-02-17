document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
});


async function loadUsers() {
    try {
        const response = await fetch('/api/v1/users');
        if (!response.ok) {
            throw new Error('Что-то не так с ответом сервера: ' + response.statusText);
        }
        const users = await response.json();
        const userTableBody = document.getElementById('userTableBody');
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles ? user.roles.map(role => role.name).join(', ') : 'Не указано'}</td>
                <td><button class="btn btn-info" onclick="editUser(${user.id})">Edit</button></td>
                <td><button class="btn btn-danger" onclick="showDeleteModal(${user.id})">Delete</button></td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при извлечении пользователей:', error);
    }
}

async function loadRoles() {
    try {
        const rolesResponse = await fetch(`/api/v1/roles`);
        if (!rolesResponse.ok) {
            throw new Error('Ошибка при извлечении ролей');
        }
        return await rolesResponse.json();
    } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
        return [];
    }
}

async function editUser(userId) {
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
    console.log('Form submitted');
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

    try {
        const response = await fetch(`/api/v1/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        let responseText = await response.text();
        console.log('Response Text:', responseText);

        if (!response.ok) {
            const invalidUser = JSON.parse(responseText)
            console.log('Parsed invalidUser:', invalidUser);
            console.log(invalidUser)
            document.getElementById('editIDError').innerText = invalidUser.idError
            document.getElementById('editNameError').innerText = invalidUser.nameError
            document.getElementById('editAgeError').innerText = invalidUser.ageError
            document.getElementById("editEmailError").innerText = invalidUser.emailError
            document.getElementById("editPasswordError").innerText = invalidUser.passwordError
            document.getElementById("editRolesError").innerText = invalidUser.rolesError
            throw new Error('Failed to update user');
        }
        document.getElementById('editNameError').innerText = ""
        document.getElementById('editAgeError').innerText = ""
        document.getElementById("editEmailError").innerText = ""
        document.getElementById("editPasswordError").innerText = ""
        document.getElementById("editRolesError").innerText = ""
        const updatedUser = JSON.parse(responseText);
        console.log('User updated successfully:', updatedUser);
        await loadUsers();
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        if (editModal) {
            editModal.hide();
        }
    } catch (error) {
        console.error('Error updating user:', error);
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
        console.error('Ошибка удаления пользователя:', error);
    }
}

async function addUser() {

    const userData = {
        username: document.getElementById('inputName').value,
        age: parseInt(document.getElementById('inputAge').value),
        email: document.getElementById("inputEmail").value,
        password: document.getElementById('inputPassword').value,
        roles: Array.from(document.getElementById('inputRoles').selectedOptions).map(option => option.textContent)
    };

    console.log(userData)

    try {

        const response = await fetch(`/api/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        let responseText = await response.text();
        console.log('Response Text:', responseText);

        if (!response.ok) {
            const invalidUser = JSON.parse(responseText)
            console.log(invalidUser)
            document.getElementById('addNameError').innerText = invalidUser.nameError
            document.getElementById('addAgeError').innerText = invalidUser.ageError
            document.getElementById("addEmailError").innerText = invalidUser.emailError
            document.getElementById("addPasswordError").innerText = invalidUser.passwordError
            document.getElementById("addRolesError").innerText = invalidUser.rolesError
            throw new Error('Failed to add user');
        }
        document.getElementById('addNameError').innerText = ""
        document.getElementById('addAgeError').innerText = ""
        document.getElementById("addEmailError").innerText = ""
        document.getElementById("addPasswordError").innerText = ""
        document.getElementById("addRolesError").innerText = ""
        const newUser = JSON.parse(responseText);
        console.log('User added successfully:', newUser);
        await loadUsers();
        document.getElementById('addUserForm').reset();
        const allUsersTab = new bootstrap.Tab(document.getElementById('nav-home-tab'));
        allUsersTab.show();
    } catch (error) {
        console.error('Error adding user:', error);
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
    console.log('Add user form submitted');
    event.preventDefault();
    await addUser();
});
document.addEventListener('DOMContentLoaded', initializeRoles);

(async () => {
    await fetchUserData("/api/v1/user");
})();