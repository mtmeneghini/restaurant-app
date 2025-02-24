### **Project Description**  
**Project Title**: Single-Restaurant Management Web App (MVP)  
**Goal**: Build a lightweight app for restaurant owners to manage their restaurant`s menu, track table orders, and view basic sales insights.  

---

### **Core Features**  
1. **Menu Manager**:  
   - **Hierarchy**: Restaurant → Menu → Menu Group → Menu Item (e.g., "Dinner" → "Salads" → "Caesar Salad").  
   - **Actions**: Create, edit, delete menus, groups, and items.  
2. **Order Manager**:  
   - Open **orders** linked to **tables** (e.g., "Table 5").  
   - Assign menu items (from any menu) to orders and track item statuses (`pending`, `preparing`, `delivered`).  
3. **Insights**:  
   - Basic analytics: Top-selling items, total revenue, orders per day.  

---

### **Tech Stack**  
- **Frontend**: React (TypeScript + Hooks), Tailwind CSS.  
- **Backend**: Node.js + Express (TypeScript).  
- **Database/Auth**: Supabase (PostgreSQL + Auth).  


### **Supabase Tables (Simplified MVP Schema)**  
1. **Users** (Handled by Supabase Auth).  
2. **Restaurants**:  
   - `id` (UUID), `user_id` (UUID → Users, **unique**), `name`, `address`, `phone_number`.  
3. **Menus**:  
   - `id` (UUID), `restaurant_id` (UUID → Restaurants), `name`.  
4. **Menu Groups**:  
   - `id` (UUID), `menu_id` (UUID → Menus), `name`.  
5. **Menu Items**:  
   - `id` (UUID), `group_id` (UUID → Menu Groups), `name`, `price`.  
6. **Tables**:  
   - `id` (UUID), `restaurant_id` (UUID → Restaurants), `label`, `status` (`available`, `occupied`, `closed`).  
7. **Orders**:  
   - `id` (UUID), `table_id` (UUID → Tables), `status` (`active`, `closed`), `created_at`.  
8. **Order Items**:  
   - `id` (UUID), `order_id` (UUID → Orders), `menu_item_id` (UUID → Menu Items), `quantity`, `item_status` (`pending`, `preparing`, `delivered`).  

---

### **Relationships**  
- **1 User → 1 Restaurant** (enforced via `unique` constraint on `restaurants.user_id`).  
- **1 Restaurant → Many Menus → Many Menu Groups → Many Menu Items**.  
- **Restaurant → Tables → Orders → Order Items**.  

--