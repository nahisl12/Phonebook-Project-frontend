import React, { useState, useEffect } from 'react';
import Person from './components/Person';
import personService from './services/persons';
import Notification from './components/Notification';

const App = () => {
  const [ persons, setPersons ] = useState([]);
  const [ newName, setNewName ] = useState('');
  const [ newNum, setNewNum ] = useState('');
  const [ searchName, setSearchName ] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const filtered = persons.filter(person => person.name.toLowerCase().includes(searchName.toLowerCase()));

  useEffect(() => {
    // Grabs data from the back end on application start
    personService
      .getAll()
      .then(initialPersons => setPersons(initialPersons))
      .catch(error => alert('data could not be found'));
  }, []);

  const onNameInput = (event) => {
    setNewName(event.target.value);
  }

  const onNumInput = (event) => {
    setNewNum(event.target.value);
  }

  const onSearchInput = (event) => {
    setSearchName(event.target.value);
  }

  // Handles logic for adding new persons
  const addPerson = (event) => {
    event.preventDefault();

    // obj holding data for each paramter of a new person instance
    const newPerson = {
      name: newName,
      num: newNum
    }

    // Checks if the currently entered name is the same as an already existing one
    const currPerson = persons.find(person => person.name.toLowerCase() === newName.toLowerCase());

    // If the person already exists then alert appropraitely
    if(currPerson) {
      alert(`${newPerson.name} is already added to phonebook`);

      // New obj holding any updates the user may want to make - To number only here
      const updatedPerson = { ...currPerson, num: newNum };

      // Asks user if they would like to replace the current number with a new one
      if(window.confirm(`Do you want to update ${currPerson.name}'s number with ${newNum}?`)){ 
        // If yes then call update function with the id of curr person & the updated data
        personService
          .update(currPerson.id, updatedPerson)
          .then(returnedPerson => {
            // maps through the current persons array checking if the ids match, if they dont then leave as is
            // Otherwise if they match then replace with new data
            setPersons(persons.map(person => person.id !== currPerson.id ? person : returnedPerson));
          })
          .catch(error => {
            // If there's an error then it will alert and then filter through the array to make sure the id is removed
            alert(`The note was not update. The entered number must be more than 8 letters long`);
            // setPersons(persons.filter(person => person.id !== currPerson.id));
          });
      }
      // Checks if the number isn't already stored 
    } else if (persons.find(person => person.num === newNum)) {
      alert(`That number is already registered`);
    }
    // Checks if the text fields aren't empty. If they aren't then create a new Person with entered details
    else if(newPerson.name.length > 1 && newPerson.num.length > 1) {
      personService
        .create(newPerson)
        .then(returnedPerson => {
          // creates a new array that concatanates the previous data + the newly created person
          setPersons(persons.concat(returnedPerson));
          setIsError(false);
          setSuccessMessage( 
            `${returnedPerson.name}' was successfully created.`
            );
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
        })
        .catch(error => {
          setErrorMessage(`the person could not be created. Enter a name greater than 3 characters and Number greater than 8 characters`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });
    }
  }

  // Delete  contact from database - takes an ID to delete and name for displaying purposes
  const deleteContact = (id, name) => {
    // If player wants to delete user then call deletePerson function
    if(window.confirm(`Delete ${name}?`)) {
      personService
        .deletePerson(id)
        .then(() => {
          alert(`Deleted ${name}`);
          // Filter through the array and create a new array with ids that do not match
          setPersons(persons.filter(item => item.id !== id));
      })
      .catch(error => alert('something went wrong'));
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} error={isError}/>
      <Notification message={errorMessage} error={isError}/>
      <div>search: <input value={searchName} onChange={onSearchInput} /></div>
      <form onSubmit={addPerson}>
        <div>name: <input onChange={onNameInput} /></div>
        <div>number: <input onChange={onNumInput} /></div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      { searchName === '' ? persons.map(person => <Person key={person.name} name={person.name} num={person.num} deleteContact={() => deleteContact(person.id, person.name)} />) : 
        filtered.map(person => <Person key={person.name} name={person.name} num={person.num} deleteContact={() => deleteContact(person.id, person.name)} />) }

    </div>
  )
}

export default App