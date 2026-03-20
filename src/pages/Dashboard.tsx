// import { FC } from 'react';

// //interface DashboardProps {}

// const Dashboard: FC<DashboardProps> = () => {
//     return (
//         <section>
//             <h1>Dashboard</h1>
//         </section>
//     );
// };

// export default Dashboard;

import AddTransactionBtn from "../components/ui/buttons/AddTransactionBtn.jsx";
import Searchbar from "../components/menus/Searchbar.jsx";

function Dashboard() {
  function transaction() {
    alert("Works!"); //test line
  }

  return (
    <section className="container bg-gray-500 rounded px-4 py-4 mx-auto my-6 max-w-6xl">
      <div className="mb-4">
        {/* Searchbar */}
        <Searchbar />
      </div>
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-300 rounded p-6">
        {/* Header */}
        <div className="flex flex-col text-center md:text-left md:w-2/3">
          <h1 className="text-indigo-400 text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-indigo-400 text-sm md:text-base leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur eum
            dolores delectus? Dignissimos debitis ipsum saepe architecto ipsam,
            nemo temporibus fugiat cumque enim excepturi delectus numquam nobis
            dolorum ratione dicta.
          </p>
        </div>

        {/* AddTransaction Button */}
        <div className="mt-4 md:mt-0 text-center">
          <AddTransactionBtn onClick={transaction} />
        </div>
      </section>

      {/* Info Status Cards */}
      <section className="flex rounded text-black px-4 py-4 my-4 justify-between">
        <div className="text-center bg-gray-300 rounded px-10 py-6">
          <h2 className="text-gray-500">Current Balance</h2>
          <p className="text-center font-bold text-2xl">${`12.000`}</p>
          <p>1.00%</p>
        </div>
        <div className="text-center bg-gray-300 rounded px-10 py-6">
          <h2 className="text-gray-500">Monthly Income</h2>
          <p className="text-center font-bold text-2xl">${`12.000`}</p>
          <p>-2.20%</p>
        </div>
        <div className="text-center bg-gray-300 rounded px-10 py-6">
          <h2 className="text-gray-500">Total Expenses</h2>
          <p className="text-center font-bold text-2xl">${`#12.000`}</p>
          <p>3.50%</p>
        </div>
        <div className="text-center bg-gray-300 rounded px-10 py-6">
          <h2 className="text-gray-500">Amount Saved</h2>
          <p className="text-center font-bold text-2xl">${`12.000`}</p>
          <p>-1.20%</p>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-4">
        <aside className="bg-white text-black col-start-3 col-end-4 rounded m-4 p-4">
          <h2>Monthly Budgets</h2>
          <div>
            <h3 className="font-bold">- Theme Example</h3>
            <p className="">$0.00/...</p>
            <p>Example Graphic</p>
          </div>
          <div>
            <h3 className="font-bold">- Theme Example</h3>
            <p className="">$0.00/...</p>
            <p>Example Graphic</p>
          </div>
          <div>
            <h3 className="font-bold">- Theme Example</h3>
            <p className="">$0.00/...</p>
            <p>Example Graphic</p>
          </div>
          <div>
            <h3 className="font-bold">- Theme Example</h3>
            <p className="">$0.00/...</p>
            <p>Example Graphic</p>
          </div>
        </aside>
      </section>
    </section>
  );
}

export default Dashboard;
