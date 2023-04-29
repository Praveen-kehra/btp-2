import React, { useState } from 'react'
import "./share.css";
// import {
//   Box,
//   Flex,
//   Text,
//   IconButton,
//   Button,
//   Stack,
//   useColorModeValue,
//   useBreakpointValue,
//   Container,
//   Heading,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
// } from "@chakra-ui/react";

export default function Share() {
  const [inputText, setInputText] = useState("");

  return (
    <div>
      <textarea 
        className='textInput' 
        type="text" 
        onChange={(e)=>{setInputText(e.target.value)}}
      >
        {inputText}
      </textarea>
    </div>
  )
}
