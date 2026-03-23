import React from 'react'

function BackgroundEffect() {
  return (
     <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/20 blur-3xl rounded-full" />
      </div>
  )
}

export default BackgroundEffect