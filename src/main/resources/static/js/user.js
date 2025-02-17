async function fetchUserData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ошибка: ' + response.status);
        }
        const user = await response.json();
        console.log(response)
        displayUserData(user);
    } catch (error) {
        console.error('Ошибка', error);
        document.getElementById('user-table-body').innerHTML = '<tr><td colspan="4" class="text-danger">Error</td></tr>';
    }
}

function displayUserData(user) {
    const usernameElement = document.getElementById('email');
    usernameElement.textContent = user.email;

    const rolesElement = document.getElementById('roles');
    rolesElement.textContent = user.roles ? user.roles.map(role => role.name).join(', ') : 'Не указано';

    const userTableBody = document.getElementById('user-table-body');

    userTableBody.innerHTML = `<tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles ? user.roles.map(role => role.name).join(', ') : 'Не указано'}</td>
            </tr>`;
    console.log(user)
}

(async () => {
    await fetchUserData("/api/v1/user");
})();