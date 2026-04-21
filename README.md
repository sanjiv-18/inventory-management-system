# Inventory Reorder Prediction System + Variance Analysis Dashboard

A professional full-stack web application for manufacturing and textile industries to manage inventory, predict stock shortages, and analyze production variances.

## 🚀 Features

### Core Modules

1. **Dashboard Home**
   - Real-time KPI cards showing Total Products, Low Stock Items, Planned/Actual Costs, Variance, Pending Reorders
   - Interactive charts: Monthly Cost Variance, Stock Status Pie Chart, Top Consumed Materials, Reorder Trends
   - Quick action buttons for common tasks

2. **Product Management**
   - Complete CRUD operations for products/items
   - Category-wise organization
   - Supplier management
   - Bulk CSV/Excel upload support
   - Search and filter functionality

3. **Production Planning & BOM**
   - Order creation with planned quantities and rates
   - Bill of Materials (BOM) management
   - Automatic planned amount calculations

4. **Actual Consumption Tracking**
   - Track actual material usage
   - Record actual rates and quantities
   - Compare against planned values

5. **Variance Analysis Engine**
   - Automatic variance calculations (Actual - Planned)
   - Material, Price, and Quantity variance breakdown
   - Profit/Loss indicators with color coding
   - Monthly variance trends

6. **Inventory Reorder Prediction**
   - Smart reorder level calculation: `(Daily Consumption × Lead Time) + Safety Stock`
   - Automatic reorder quantity suggestions
   - Urgency level indicators (Urgent, High, Medium, Normal)
   - Stockout predictions

7. **Dataset Upload & Smart Analyzer**
   - Drag & drop CSV/Excel file upload
   - Automatic column detection and mapping
   - Bulk product and order import
   - Error reporting and validation

8. **Reports Section**
   - PDF and Excel report generation
   - Variance Reports, Reorder Reports, Inventory Reports
   - Monthly cost analysis
   - Export functionality

9. **Smart Search & Filters**
   - Multi-criteria filtering (Date, Product, Supplier, Category)
   - Real-time search functionality
   - Status-based filtering

## 🛠 Tech Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for modern, responsive styling
- **Recharts** for interactive charts
- **Lucide React** for beautiful icons
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **XLSX** for Excel processing
- **Helmet** for security
- **Rate Limiting** for API protection

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-reorder-prediction-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Environment Setup**
   - Copy `server/.env` and configure your database URL and JWT secret
   - Default MongoDB URI: `mongodb://localhost:27017/inventory_system`

4. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

## 🏗 Project Structure

```
inventory-reorder-prediction-system/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                     # Node.js backend
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── uploads/                # File upload directory
│   ├── index.js               # Server entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── package.json               # Root package.json
└── README.md
```

## 📊 Database Schema

### User Model
- Authentication and authorization
- Role-based access (Admin, Manager, User)

### Product Model
- Item information and specifications
- Stock management fields
- Supplier details
- Reorder calculation fields

### Order Model
- Production orders with planned/actual data
- BOM items with variance tracking
- Status management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Low stock alerts
- `GET /api/products/alerts/reorder-predictions` - Reorder predictions

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order

### Variance Analysis
- `GET /api/variance` - Variance analysis
- `GET /api/variance/trends` - Monthly variance trends

### Reorder Prediction
- `GET /api/reorder` - Reorder predictions
- `GET /api/reorder/:id` - Product-specific reorder analysis

### Data Upload
- `POST /api/upload/products` - Bulk product upload
- `POST /api/upload/orders` - Bulk order upload
- `GET /api/upload/template/:type` - Download templates

### Reports
- `GET /api/reports/variance` - Generate variance report
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/reorder` - Generate reorder report

## 🎯 Business Logic

### Variance Calculation
```
Variance = Actual Amount − Planned Amount
Material Variance = (Actual Quantity − Planned Quantity) × Planned Rate
Price Variance = (Actual Rate − Planned Rate) × Actual Quantity
```

### Reorder Prediction
```
Reorder Level = (Daily Consumption × Lead Time) + Safety Stock
Reorder Quantity = Reorder Level − Current Stock
```

### Urgency Levels
- **Urgent**: Stock will run out within lead time
- **High**: Stock will run out within 2x lead time
- **Medium**: Reorder needed but not immediate
- **Normal**: No immediate action required

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

## 📱 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Glassmorphism**: Modern card designs with blur effects
- **Smooth Animations**: Professional transitions and micro-interactions
- **Color-coded Alerts**: Visual indicators for different states
- **Interactive Charts**: Hover effects and tooltips

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `CLIENT_URL` - Frontend URL for CORS

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests (when implemented)
cd server && npm test
```

## 📈 Performance Features

- **Pagination**: Large datasets handled efficiently
- **Caching**: Frequently accessed data cached
- **Lazy Loading**: Components loaded on demand
- **Optimized Queries**: Database queries indexed
- **Compression**: Gzip compression enabled

## 🔄 Future Enhancements

- **AI/ML Integration**: Demand forecasting
- **Email Notifications**: Automated reorder alerts
- **WhatsApp Integration**: Mobile notifications
- **Multi-tenant Support**: Multiple organizations
- **Advanced Analytics**: Business intelligence dashboard
- **Mobile App**: React Native application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@inventorypro.com
- Documentation: [Link to docs]
- Issues: [Link to GitHub Issues]

---

**Built with ❤️ for the manufacturing and textile industry**
