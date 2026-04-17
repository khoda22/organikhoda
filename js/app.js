let currentActivityId = null;

// AGREGAR ACTIVIDAD
function handleAddActivity() {
    const input = document.getElementById('input-activity-name');
    const name = input.value.trim();
    
    if (!name) return alert("Escribe un nombre");

    const db = getDB();
    const newAct = {
        id: Date.now(),
        nombre: name,
        tareas: []
    };

    db.push(newAct);
    saveDB(db);
    input.value = "";
    renderActivities();
}

// RENDERIZAR LISTA (PAGINA 3)
function renderActivities() {
    const list = document.getElementById('activities-list');
    const db = getDB();
    list.innerHTML = "";

    db.forEach(act => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `<span>${act.nombre}</span>`;
        el.onclick = () => showDetail(act.id);
        list.appendChild(el);
    });
    navigateTo('page-3');
}

// MOSTRAR DETALLE (PAGINA 4)
function showDetail(id) {
    currentActivityId = id;
    const db = getDB();
    const act = db.find(a => a.id === id);
    
    document.getElementById('detail-title').innerText = act.nombre;
    const tasksList = document.getElementById('tasks-list');
    const trigger = document.getElementById('add-task-trigger');
    
    tasksList.innerHTML = "";
    trigger.innerHTML = "";

    if (act.tareas.length === 0) {
        trigger.innerHTML = `<button class="btn btn-primary" onclick="navigateTo('page-5')">Agregar tarea</button>`;
    } else {
        act.tareas.forEach((tarea, index) => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <input type="checkbox" onchange="completeTask(${index})">
                <span>${tarea}</span>
            `;
            tasksList.appendChild(div);
        });
        // Botón pequeño para seguir agregando si ya hay tareas
        trigger.innerHTML = `<button class="btn btn-success" onclick="navigateTo('page-5')">+ Nueva Tarea</button>`;
    }
    navigateTo('page-4');
}

// COMPLETAR TAREA (BORRAR CON CHECK)
function completeTask(index) {
    if (confirm("¿Tarea terminada?")) {
        const db = getDB();
        const act = db.find(a => a.id === currentActivityId);
        act.tareas.splice(index, 1);
        saveDB(db);
        alert("Tarea terminada");
        showDetail(currentActivityId);
    } else {
        showDetail(currentActivityId); // Reset visual
    }
}

// GUARDAR TAREA (PAGINA 5)
function handleAddTask() {
    const input = document.getElementById('input-task-name');
    const taskName = input.value.trim();
    if (!taskName) return;

    const db = getDB();
    const act = db.find(a => a.id === currentActivityId);
    act.tareas.push(taskName);
    saveDB(db);
    
    input.value = "";
    showDetail(currentActivityId);
}

// ELIMINAR ACTIVIDAD (PAGINA 2.2)
function renderDeletePage() {
    const list = document.getElementById('delete-list');
    const db = getDB();
    list.innerHTML = "";

    db.forEach(act => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.borderLeft = "5px solid var(--danger)";
        el.innerHTML = `<span>${act.nombre}</span> <small>Eliminar</small>`;
        el.onclick = () => deleteActivity(act.id);
        list.appendChild(el);
    });
    navigateTo('page-2-2');
}

function deleteActivity(id) {
    const db = getDB();
    const act = db.find(a => a.id === id);
    
    if (act.tareas.length > 0) {
        if (!confirm("Esta actividad tiene tareas pendientes. ¿Deseas eliminarla?")) return;
    }

    const newDb = db.filter(a => a.id !== id);
    saveDB(newDb);
    renderDeletePage();
}

// Vincular el botón de quitar del inicio
document.querySelector('.btn-danger').onclick = () => renderDeletePage();