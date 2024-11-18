// Import the libheif library
import React from "react";
import { useState, useEffect } from "react";



export async function loadLibheif(): Promise<any> {
  console.log('libheif initialization started');

  try {
    if (typeof window !== 'undefined') {
      // Dynamically import libheif only on the client side
      //@ts-ignore
      const libheif = await import('libheif-js/wasm-bundle');
      const heifDecoder = new libheif.HeifDecoder();
      console.log('libheif initialized successfully');
      return heifDecoder; // Return the initialized decoder
    }
  } catch (err) {
    console.error('Error initializing libheif:', err);
    throw new Error('Failed to initialize libheif: ' + err); // Propagate the error
  }
}


