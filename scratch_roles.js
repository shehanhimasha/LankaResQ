import axios from 'axios';

async function check() {
    try {
        const res = await axios.get('http://disastermgtpro.runasp.net/api/users', {
            params: { PageSize: 100 }
        });
        const users = res.data.items || res.data;
        const roles = [...new Set(users.map(u => `${u.role} (${u.roleId})`))];
        console.log("Roles found:", roles);
        
        // Print a few sample users
        users.slice(0, 5).forEach(u => console.log(`${u.email} -> ${u.role} (ID: ${u.roleId})`));
    } catch(e) {
        console.error(e.message);
    }
}
check();
