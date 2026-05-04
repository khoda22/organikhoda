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

// LÓGICA DE RACHA
function updateStreak() {
    const db = getDB();
    const streakData = JSON.parse(localStorage.getItem('organikhoda_streak')) || { count: 0, lastDate: null };
    const today = new Date().toLocaleDateString();

    // Si la última vez fue ayer, se mantiene la racha. Si fue antes, se pierde.
    // Para simplificar: solo aumenta si hoy completaste algo y ayer también.
    document.getElementById('streak-count').innerText = streakData.count;
}

// Modificar la función completeTask para que afecte la racha
function completeTask(index) {
    if (confirm("¿Tarea terminada?")) {
        const db = getDB();
        const act = db.find(a => a.id === currentActivityId);
        act.tareas.splice(index, 1);
        saveDB(db);
        
        // Lógica Racha
        handleStreakLogic();
        
        alert("¡Tarea terminada! 🔥");
        showDetail(currentActivityId);
        updateStreak();
    }
}

function handleStreakLogic() {
    let streakData = JSON.parse(localStorage.getItem('organikhoda_streak')) || { count: 0, lastDate: null };
    const today = new Date().toLocaleDateString();

    if (streakData.lastDate !== today) {
        streakData.count++;
        streakData.lastDate = today;
        localStorage.setItem('organikhoda_streak', JSON.stringify(streakData));
    }
}

// NUEVA FUNCIÓN: RENDER RESUMEN (DRAGGABLE)
function renderSummary() {
    const container = document.getElementById('summary-content');
    const db = getDB();
    container.innerHTML = "";

    db.forEach((act, actIdx) => {
        const actBlock = document.createElement('div');
        actBlock.className = 'summary-block';
        actBlock.dataset.id = act.id;
        actBlock.innerHTML = `<h3>${act.nombre}</h3><div class="task-sortable" id="tasks-${actIdx}"></div>`;
        
        const taskContainer = actBlock.querySelector('.task-sortable');
        
        act.tareas.forEach((tarea, taskIdx) => {
            const tDiv = document.createElement('div');
            tDiv.className = 'drag-item';
            tDiv.innerText = tarea;
            taskContainer.appendChild(tDiv);
        });

        container.appendChild(actBlock);

        // Hacer tareas movibles dentro de la actividad
        new Sortable(taskContainer, {
            animation: 150,
            onEnd: () => saveOrder()
        });
    });

    // Hacer actividades movibles entre sí
    new Sortable(container, {
        animation: 150,
        onEnd: () => saveOrder()
    });

    navigateTo('page-summary');
}

// GUARDAR EL NUEVO ORDEN
function saveOrder() {
    const newDb = [];
    document.querySelectorAll('.summary-block').forEach(block => {
        const id = parseInt(block.dataset.id);
        const originalAct = getDB().find(a => a.id === id);
        
        const updatedTasks = [];
        block.querySelectorAll('.drag-item').forEach(item => {
            updatedTasks.push(item.innerText);
        });
        
        newDb.push({
            ...originalAct,
            tareas: updatedTasks
        });
    });
    saveDB(newDb);
}

// Al cargar la app
document.addEventListener('DOMContentLoaded', () => {
    updateStreak();
});


// Función para generar un color único basado en texto (Hasing)
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
}

// ACTUALIZACIÓN DE RENDER CALENDAR
function renderCalendar() {
    const pool = document.getElementById('pending-tasks-pool');
    const db = getDB();
    const weeklyData = JSON.parse(localStorage.getItem('organikhoda_weekly')) || {};
    
    pool.innerHTML = "";
    document.querySelectorAll('.day-dropzone').forEach(zone => zone.innerHTML = "");

    // Función auxiliar para crear el elemento de tarea con color y click
    const createItem = (taskText, activityName) => {
        const item = document.createElement('div');
        item.className = 'calendar-task';
        item.innerText = taskText;
        
        // Aplicar color según la actividad
        const color = stringToColor(activityName);
        item.style.backgroundColor = color;
        
        // Evento para ver detalle
        item.onclick = (e) => {
            // Evitamos que el click interfiera con el arrastre
            if (!item.classList.contains('sortable-chosen')) {
                showTaskDetail(activityName, taskText);
            }
        };
        return item;
    };

    // Llenar el Pool y los días usando la función auxiliar
    db.forEach(act => {
        act.tareas.forEach(tarea => {
            const fullText = `${act.nombre}: ${tarea}`;
            let isAssigned = false;
            for(let day in weeklyData) {
                if(weeklyData[day].includes(fullText)) isAssigned = true;
            }

            if(!isAssigned) {
                pool.appendChild(createItem(fullText, act.nombre));
            }
        });
    });

    for(let day in weeklyData) {
        const zone = document.getElementById(`drop-${day}`);
        weeklyData[day].forEach(taskText => {
            // Extraemos el nombre de la actividad para el color (asumiendo formato "Actividad: Tarea")
            const activityPart = taskText.split(': ')[0];
            zone.appendChild(createItem(taskText, activityPart));
        });
    }

    // Reiniciar Sortable
    const zones = document.querySelectorAll('.day-dropzone');
    [pool, ...zones].forEach(el => {
        new Sortable(el, {
            group: 'weeklyShared',
            animation: 150,
            onEnd: () => saveWeeklyOrder()
        });
    });

    navigateTo('page-calendar');
}

// FUNCIÓN PARA MOSTRAR EL MODAL DE DETALLE
function showTaskDetail(activity, task) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <h3 style="color:${stringToColor(activity)}">${activity}</h3>
        <p><strong>Tarea:</strong> ${task.replace(activity + ': ', '')}</p>
        <hr>
        <p style="font-size:0.8rem">Esta actividad pertenece a tus cursos/proyectos de ORGANIKhoda.</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };
}

const createItem = (taskText, activityName) => {
    const item = document.createElement('div');
    item.className = 'calendar-task';
    
    // El texto se guarda internamente para el modal, 
    // pero el CSS con font-size: 0 lo ocultará en las celdas
    item.innerText = taskText; 
    
    const color = stringToColor(activityName);
    item.style.backgroundColor = color;
    
    // Tooltip nativo (opcional): si dejas el dedo puesto 
    // un segundo, el cel te mostrará el texto flotante
    item.title = taskText; 

    item.onclick = (e) => {
        // Si no se está arrastrando, mostramos el detalle
        if (!item.classList.contains('sortable-chosen')) {
            showTaskDetail(activityName, taskText);
        }
    };
    return item;
};