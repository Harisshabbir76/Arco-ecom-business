# Online Payment Removal - TODO

## Plan Steps (Approved)

### 1. Backend Cleanup ✅ (Analysis Complete)
- [ ] Delete `backend/routes/paymentRoutes.js`
- [ ] Update `backend/Models/Order.js` - Remove Stripe fields
- [ ] Update `backend/package.json` - Remove stripe dep
- [ ] Update `backend/index.js` - Remove payment routes & webhook middleware
- [ ] Update `backend/routes/orderRoutes.js` - Remove payment handling
- [ ] Remove STRIPE_* from `.env`

### 2. Frontend Cleanup
- [ ] Simplify `frontend/src/components/CheckoutPage.js` → Pure COD only
- [ ] Update `frontend/src/components/OrderManagement.js` - Remove payment display
- [ ] Update `frontend/src/components/ExportOrders.js` - Remove paymentMethod from export
- [ ] Update `frontend/package.json` - Remove stripe deps if any

### 3. Finalization & Testing
- [ ] Backend: `npm uninstall stripe`
- [ ] Frontend: `npm uninstall @stripe/stripe-js` (if present)
- [ ] Test COD checkout end-to-end
- [ ] Test dashboard orders/export
- [ ] Restart servers

**Next:** Read remaining files then execute edits step-by-step.

Updated after each step.

