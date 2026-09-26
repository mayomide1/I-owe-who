const people_cards      = document.getElementById("people_cards");
const ownersName        = document.getElementById("owners_name");
const add_person_btn    = document.getElementById("add_person_btn");
const person_cards      = document.getElementById("person_cards");
const transaction_input = document.getElementById("transaction_input");

const people_panel      = document.getElementById("people_panel");
const details_panel     = document.getElementById("details_panel");
const back_btn          = document.getElementById("back_btn");

let transactions = JSON.parse(localStorage.getItem("transaction")) || [];
let selectedIndex = null;

// Migration: make sure every notification has a unique id
transactions.forEach((p) => {
    (p.notifications || []).forEach((n, i) => {
        if (!n.id) n.id = Date.now() + i;
    });
});

const save = () => {
    localStorage.setItem("transaction", JSON.stringify(transactions));
};

const showPeopleView = () => {
    people_panel.classList.remove("hidden");
    details_panel.classList.add("hidden");
    selectedIndex = null;
    person_cards.innerHTML = "";
    transaction_input.innerHTML = "";
    renderList();
};

const showDetailsView = () => {
    people_panel.classList.add("hidden");
    details_panel.classList.remove("hidden");
};

back_btn.addEventListener("click", showPeopleView);

const addNewPerson = () => {
    const name = ownersName.value.trim();
    if (name === "") {
        alert("Enter a name");
        return;
    }

    transactions.push({
        name: name,
        amount: 0,
        notifications: [],
    });

    save();
    ownersName.value = "";
    renderList();
};

const renderList = () => {
    const peopleHTML = transactions
        .map((t, index) => `
            <div class="people-card ${index === selectedIndex ? "active" : ""}" data-index="${index}">
                <div class="avatar">${t.name.charAt(0).toUpperCase()}</div>
                <div class="info">
                    <p class="name">${t.name}</p>
                    <p class="amount">₦${Number(t.amount).toLocaleString()}</p>
                </div>
                <button class="delete-btn" title="Delete">
                    Delete <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `)
        .join("");

    people_cards.innerHTML = peopleHTML || `<p class="empty">No person added yet</p>`;
};

people_cards.addEventListener("click", (event) => {
    const card = event.target.closest(".people-card");
    if (!card) return;

    const index = parseInt(card.dataset.index, 10);
    if (Number.isNaN(index)) return;

    if (event.target.closest(".delete-btn")) {
        event.stopPropagation();
        deletePerson(index);
        return;
    }

    openPeopleCards(index);
});

const openPeopleCards = (index) => {
    const person = transactions[index];
    if (!person) return;

    selectedIndex = index;

    const notificationsHTML = person.notifications.length
        ? person.notifications
              .map((n) => `
                  <div class="notification ${n.type}" data-id="${n.id}">
                      <div class="notification-left">
                          <span class="notif-label">${n.label}</span>
                          ${n.note ? `<span class="notif-note">${n.note}</span>` : ""}
                          <span class="notif-date">${n.date}</span>
                      </div>
                      <div class="notification-right">
                          <span class="notif-amount">₦${Number(n.amount).toLocaleString()}</span>
                          <button class="edit-notif-btn" title="Edit">
                              Edit <i class="fa-solid fa-pen"></i>
                          </button>
                          <button class="delete-notif-btn" title="Delete">
                              Delete <i class="fa-solid fa-trash"></i>
                          </button>
                      </div>
                  </div>
              `)
              .join("")
        : `<p class="empty">No transactions yet</p>`;

    person_cards.innerHTML = `
        <div class="person-header">
            <div class="avatar big">${person.name.charAt(0).toUpperCase()}</div>
            <div>
                <h3>${person.name}</h3>
                <p class="balance">Balance: <strong>₦${Number(person.amount).toLocaleString()}</strong></p>
            </div>
        </div>

        <div class="actions">
            <button class="money-received-btn">
                <i class="fa-solid fa-plus"></i> Money Received
            </button>
            <button class="money-sent-btn">
                <i class="fa-solid fa-minus"></i> Money Sent
            </button>
        </div>

        <div class="notification-list">
            <h4>History</h4>
            ${notificationsHTML}
        </div>
    `;

    document
        .querySelector(".money-received-btn")
        .addEventListener("click", () => showMoneyForm(index, "received"));
    document
        .querySelector(".money-sent-btn")
        .addEventListener("click", () => showMoneyForm(index, "sent"));

    person_cards.querySelectorAll(".edit-notif-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.closest(".notification").dataset.id);
            editNotification(index, id);
        });
    });

    person_cards.querySelectorAll(".delete-notif-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.target.closest(".notification").dataset.id);
            deleteNotification(index, id);
        });
    });

    showDetailsView();
};

const showMoneyForm = (index, type) => {
    const isReceived = type === "received";
    const label = isReceived ? "Money Received" : "Money Sent";
    const inputId = isReceived ? "money_received_input" : "money_sent_input";
    const noteId = isReceived ? "money_received_note" : "money_sent_note";
    const saveClass = isReceived ? "save_money_received" : "save_money_sent";

    transaction_input.innerHTML = `
        <div class="money-form">
            <p>Enter ${label}</p>
            <input id="${inputId}" type="number" min="0" placeholder="Amount" />
            <input id="${noteId}" type="text" placeholder="Note (optional)" />
            <button class="${saveClass}">Save</button>
        </div>
    `;

    const input = document.getElementById(inputId);
    const noteInput = document.getElementById(noteId);
    input.focus();

    document.querySelector(`.${saveClass}`).addEventListener("click", () => {
        const value = Number(input.value);
        if (!value || value <= 0) {
            alert("Enter a valid amount");
            return;
        }
        recordTransaction(index, type, value, noteInput.value.trim());
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") noteInput.focus();
    });
    noteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.querySelector(`.${saveClass}`).click();
    });
};

const recordTransaction = (index, type, amount, note = "") => {
    const person = transactions[index];
    if (!person) return;

    const isReceived = type === "received";

    person.amount += isReceived ? amount : -amount;

    person.notifications.push({
        id: Date.now(),
        type,
        label: isReceived ? "Received" : "Sent",
        amount,
        note,
        date: new Date().toLocaleDateString(),
    });

    save();
    transaction_input.innerHTML = "";
    openPeopleCards(index);
};

const editNotification = (personIndex, notifId) => {
    const person = transactions[personIndex];
    if (!person) return;

    const notif = person.notifications.find((n) => n.id === notifId);
    if (!notif) return;

    const newAmountRaw = prompt("Edit amount:", notif.amount);
    if (newAmountRaw === null) return;

    const newAmount = Number(newAmountRaw);
    if (!newAmount || newAmount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    const newNote = prompt("Edit note:", notif.note || "");
    if (newNote === null) return;

    const isReceived = notif.type === "received";

    // Undo old effect on balance
    person.amount -= isReceived ? notif.amount : -notif.amount;

    // Apply new values
    notif.amount = newAmount;
    notif.note = newNote.trim();
    person.amount += isReceived ? newAmount : -newAmount;

    save();
    openPeopleCards(personIndex);
};

const deleteNotification = (personIndex, notifId) => {
    const person = transactions[personIndex];
    if (!person) return;

    const notifIndex = person.notifications.findIndex((n) => n.id === notifId);
    if (notifIndex === -1) return;

    const confirmed = confirm("Delete this transaction?");
    if (!confirmed) return;

    const notif = person.notifications[notifIndex];
    const isReceived = notif.type === "received";

    // Reverse its effect on balance
    person.amount -= isReceived ? notif.amount : -notif.amount;

    person.notifications.splice(notifIndex, 1);

    save();
    openPeopleCards(personIndex);
};

const deletePerson = (index) => {
    const confirmed = confirm("Are you sure you want to delete this person?");
    if (!confirmed) return;

    const wasSelected = selectedIndex === index;

    transactions.splice(index, 1);

    if (wasSelected) {
        showPeopleView();
    }

    save();
    renderList();
};

add_person_btn.addEventListener("click", addNewPerson);
ownersName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addNewPerson();
});

renderList();