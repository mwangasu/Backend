function DashboardCards({ dashboard }) {

    const stats = [

        {
            title: "Total Reports",
            value: dashboard.total_feedback
        },

        {
            title: "High Priority Cases",
            value: dashboard.high_priority
        },

        {
            title: "Categories",
            value: dashboard.categories.length
        },

        {
            title: "Active Wards",
            value: dashboard.wards.length
        }

    ];

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {stats.map((stat) => (

                <div
                    key={stat.title}
                    className="card"
                >

                    <p className="card-title">

                        {stat.title}

                    </p>

                    <h2 className="card-value">

                        {stat.value}

                    </h2>

                </div>

            ))}

        </div>

    );

}

export default DashboardCards;