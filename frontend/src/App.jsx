import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdArrowRoundBack, IoIosAdd } from "react-icons/io";
import { TiMinus } from "react-icons/ti";
import { MdEdit, MdDelete } from "react-icons/md";

const App = () => {
  const [name, setName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [openInput, setOpenInput] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);

  const url = import.meta.env.VITE_API_URL || "https://i-owe-who.onrender.com";

  async function renderPeople() {
    try {
      const response = await axios.get(`${url}/people`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function addPerson() {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Enter a name");
      return;
    }

    const payload = { name: trimmed };

    try {
      setSubmitting(true);
      await axios.post(`${url}/people`, payload);
      setName("");
    } catch (error) {
      console.error("Error creating person:", error.message);
      alert(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
      renderPeople();
    }
  }

  async function deletePerson(id) {
    try {
      const confirmed = confirm(
        "Are you sure you want to delete this person?",
      );
      if (!confirmed) return;
      await axios.delete(`${url}/people/${id}`);
      renderPeople();
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function renderNotification(id) {
    try {
      const response = await axios.get(`${url}/people/${id}/notifications`);
      setSelectedPerson(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function saveNotification(id) {
    try {
      if (!amount.trim()) {
        alert("Enter an amount");
        return;
      }
      setSubmitting(true)
      const payload = { amount, note, label };
      await axios.post(`${url}/people/${id}/notifications`, payload);
      alert("Saved successfully");
      await renderNotification(id);
      await renderPeople();
      setOpenInput(false);
      setAmount("");
      setNote("");
      setLabel("");
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }finally{
      setSubmitting(true)
    }
  }

  async function deleteNotification(personId, notificationId) {
    try {
      const confirmed = confirm(
        "Are you sure you want to delete this notification?",
      );
      if (!confirmed) return;
      await axios.delete(
        `${url}/people/${personId}/notifications/${notificationId}`,
      );
      await renderNotification(personId);
      await renderPeople();
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function editNotification(personId, notificationId) {
    try{
    setSubmitting(true);
    const payload = { amount, note };
    await axios.put(
      `${url}/people/${personId}/notifications/${notificationId}`,
      payload
    );
    await renderNotification(personId);
    await renderPeople();
    setEditingId(null);
    setOpenInput(false);
    setAmount("");
    setNote("");
    setLabel("");
    }catch(error){
      console.error("Erro fething data", error.message)
    }finally{
      setSubmitting(false)
    }
  }

  useEffect(() => {
    renderPeople();
  }, []);

  return (
    <div className="app">
      <h1 className="app-title">I OWE WHO</h1>

      {!selectedPerson && (
        <div>
          <div className="add-person-form">
            <input
              className="input-field"
              value={name}
              type="text"
              placeholder="Enter name"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
            />
            <button
              className="btn btn-primary"
              onClick={addPerson}
              disabled={submitting}
            >
              {submitting ? (
                "Adding..."
              ) : (
                <>
                  <IoIosAdd fontSize={25} /> Add Person
                </>
              )}
            </button>
          </div>

          <div className="cards">
            {transactions.map((transaction) => {
              return (
                <div
                  className="card"
                  key={transaction._id}
                  onClick={() => setSelectedPerson(transaction)}
                >
                  <div className="card-left">
                    <div className="img-placeholder">
                      {transaction.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="card-info">
                      <h2 className="card-name">{transaction.name}</h2>
                      <p className="card-amount">
                        ₦{Number(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="card-right">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePerson(transaction._id);
                      }}
                    >
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPerson && (
        <div className="detail-view">
          <button
            className="btn btn-secondary back-btn"
            onClick={() => {
              setSelectedPerson(null);
              setOpenInput(false);
            }}
          >
            <IoMdArrowRoundBack fontSize={25} /> Back
          </button>

          <div className="detail-header">
            <div className="img-placeholder img-placeholder-lg">
              {selectedPerson.name.charAt(0).toUpperCase()}
            </div>
            <div className="detail-info">
              <h2 className="detail-name">{selectedPerson.name}</h2>
              <p className="detail-balance">
                Balance: ₦{Number(selectedPerson.amount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="actions-section">
            <div className="action-buttons">
              <button
                className="btn btn-success"
                onClick={() => {
                  setOpenInput(!openInput);
                  setLabel("Received");
                }}
              >
                <IoIosAdd fontSize={25} /> Money Received
              </button>
              <button
                className="btn btn-warning"
                onClick={() => {
                  setOpenInput(!openInput);
                  setLabel("Sent");
                }}
              >
                <TiMinus /> Money Sent
              </button>
            </div>

            {openInput && (
              <div className="input-panel">
                <h2 className="input-panel-title">{editingId ? "Edit Transaction" : `Enter Money ${label}`}</h2>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  className="input-field"
                  type="text"
                  placeholder="Note (Optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                      if (editingId) {
                        editNotification(selectedPerson._id, editingId);
                      } else {
                        saveNotification(selectedPerson._id);
                      }
                  }}
                >
                {submitting ? ("Saving..") : ("Save")}
                </button>
                <button
                className="btn btn-primary"
                onClick={() => setOpenInput(false)}
                >Close</button>
              </div>
            )}
          </div>

          <h2 className="history-title">History</h2>
          <div className="history-list">
            {selectedPerson.notifications.map((notif) => {
              return (
                <div className="history-item" key={notif._id}>
                  <div className="history-left">
                    <h3 className="history-label">
                      {notif.label.slice(0, 1).toUpperCase()}
                      {notif.label.slice(1)}
                    </h3>
                    <p className="history-date">{notif.note}</p>
                    <p className="history-date">{notif.date}</p>
                  </div>
                  <div className="history-right">
                    <h3 className="history-amount">
                      ₦{Number(notif.amount).toLocaleString()}
                    </h3>
                    <div className="history-actions">
                      <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                          setEditingId(notif._id);
                          setAmount(notif.amount);
                          setNote(notif.note);
                          setLabel(notif.label);
                          setOpenInput(true);
                        }}>
                        <MdEdit />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          deleteNotification(selectedPerson._id, notif._id)
                        }
                      >
                        <MdDelete />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
