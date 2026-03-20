import { IconPlus } from '@tabler/icons-react';

function AddTransactionBtn({}: {
    onClick: () => void; // Uncomment if you want to handle click events
}) {
    return (
        <button className="add-transaction-btn flex ml-2 font-medium items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            <IconPlus size={20} /> Add Transaction
        </button>
    );
}

export default AddTransactionBtn;