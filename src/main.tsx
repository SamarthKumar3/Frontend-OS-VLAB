import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import FirstFit from './routes/Memory-Management/Fits/First-Fit.tsx'
import BestFit from './routes/Memory-Management/Fits/Best-Fit.tsx'
import WorstFit from './routes/Memory-Management/Fits/Worst-Fit.tsx'
import NextFit from './routes/Memory-Management/Fits/Next-Fit.tsx'
import ErrorPage from './error.tsx'
import Logic from './routes/Memory-Management/Logic.tsx';
import About from './routes/About-Us.tsx';
import Contact from './routes/Contact.tsx';
import Simulations from './routes/Simulations.tsx';
import PC from './routes/Producer-Consumer/PC.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/About-Us",
    element: <About />,
  },
  {
    path: '/Contact',
    element: <Contact />,
  },
  {
    path: "/Simulations",
    element: <Simulations />,
  },
  {
    path: "Memory-Management",
    element: <Logic />,
    children: [
      {
        path: "First-Fit",
        element: <FirstFit />,
      },
      {
        path: "Best-Fit",
        element: <BestFit />,
      },
      {
        path: "Worst-Fit",
        element: <WorstFit />,
      },
      {
        path: "Next-Fit",
        element: <NextFit />,
      },
    ],
  },
  {
    path: "/FCFS"
  },
  {
    path: "/SJF"
  },
  {
    path: "/Producer-Consumer",
    element: <PC />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
