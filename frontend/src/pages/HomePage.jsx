// /pages/HomePage.jsx

export default function HomePage() {
    return(
        <div style={{ paddong: "20px"}}>
            <h1>Welcome to Inventory Management System</h1>

            <p>
                This system allows you to manage warehouses, track inventory, 
                and keep eveything organized from one simple interface.
            </p>

            <div style={{ marginTop: "30px"}}>
                <a href="/warehouses" style={{ marginRight: "20px"}}>
                    Go to Warehouses →
                </a>

                <a href="/inventory">
                    View Inventory →
                </a>
            </div>
        </div>
    );
}