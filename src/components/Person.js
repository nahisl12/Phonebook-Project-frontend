import React from 'react'

const Person = ({ name, num, deleteContact }) => {
  return (
    <div>
      {name} {num}
      <button onClick={deleteContact}>delete</button>
    </div>
  )
}

export default Person
