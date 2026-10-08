import { useState } from 'react'
import axios from "axios"

const App = () => {
  const [name, setName] = useState("")
  const [transactions, setTransactions] = useState([])
  const [submitting, setSubmitting] = useState(false);

  const url = import.meta.env.VITE_API_URL

  async function addPerson(){
 const trimmed = name.trim();
    if (!trimmed) {
      alert("Enter a name");
      return;
    }

    const payload = { name: trimmed };

    try {
      setSubmitting(true);
      const response = await axios.post(`${url}/people`, payload);
      setName("");   
    } catch (error) {
      console.error("Error creating person:", error.message);
      alert(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  }

async function renderPeople(){
  try{
    const response = await axios.get(`${url}/people`)
    setTransactions(response.data)
  }catch(error){
    console.error('Error fetching data:', error.message);
  }
}

renderPeople();


async function deletePerson(){
  try{

  }catch(error){
    console.error('Error fetching data:', error.message);
  }
}


  return (
    <div>
      <h1>I OWE WHO</h1>
      <input value={name} type="text" placeholder='Enter name' onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPerson()}/>
      <button onClick={addPerson} disabled={submitting}>
        {submitting ? "Adding..." : "Add Person"}
      </button>

      <div className='cards'>
       { transactions.map((transaction) => {
          return(
        <div className='card' key={transaction._id}>
          <div className='card-left'>
          <div className="img-placeholder"></div>
          <div>
            <h2>{transaction.name}</h2>
            <p>₦{transaction.amount}</p>
          </div>
        </div>
        <div className='card-right'>
          <button>Delete</button>
        </div>
        </div>    
          )
        })}

      </div>
    </div>
  )
}

export default App