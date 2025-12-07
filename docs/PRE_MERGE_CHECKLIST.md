# Pre-Merge Testing Checklist

**Branch**: `feature/compare-dev-stack`
**Target**: `dev`
**What**: Cart system implementation complete

Before merging, run through this checklist to ensure everything is rock solid.

---

## 🚀 Quick Start (5 minutes)

### 1. Verify Containers Are Running

```bash
# Check all services
docker-compose ps

# You should see:
# ✓ nginx (healthy)
# ✓ app (healthy)
# ✓ medusa (healthy)
# ✓ medusa_postgres (healthy)
# ✓ redis (healthy)
```

**If not healthy**, run:
```bash
docker-compose down
docker-compose up -d
sleep 30
docker-compose ps
```

### 2. Clear Browser Cache & localStorage

```javascript
// In browser DevTools Console
localStorage.removeItem('medusa_cart_id');
localStorage.clear();
// Then Ctrl+Shift+Delete to clear browser cache
```

---

## ✅ Functional Testing (15 minutes)

### Test 1: Shop Page Loads

**Action**: Navigate to `https://localhost/shop`

**Expected**:
- ✅ Page loads without errors
- ✅ 3 products visible: "Quick Task" ($50), "Standard Project" ($150), "Premium Solution" ($500)
- ✅ Each product has an "Add Cart" button
- ✅ No console errors (F12 → Console)

**If fails**:
```bash
docker-compose logs app | tail -20
docker-compose logs medusa | tail -20
```

---

### Test 2: Add Single Item to Cart

**Action**:
1. On `/shop` page, click "Add Cart" on "Quick Task" ($50)
2. Wait for response

**Expected**:
- ✅ Success toast appears: "Added to cart!"
- ✅ Cart icon badge updates to "1"
- ✅ No error message
- ✅ Browser console shows no errors

**If "Failed to add item to cart"**:
- Check: Is Medusa running? `docker-compose ps medusa`
- Check: Does product have variants?
  ```bash
  docker exec nextjs_app wget -q -O- http://medusa:9000/store/products | jq '.products[0].variants'
  ```

---

### Test 3: View Cart

**Action**: Click cart icon in header

**Expected**:
- ✅ Cart page loads
- ✅ Shows "Quick Task" × 1
- ✅ Shows "$50.00" total
- ✅ Has "Update Quantity" and "Remove" buttons

---

### Test 4: Update Quantity

**Action**:
1. On cart page, change quantity from 1 → 3
2. Click "Update Quantity" button

**Expected**:
- ✅ Quantity updates to 3
- ✅ Total updates to "$150.00"
- ✅ No error message

---

### Test 5: Add Multiple Items

**Action**:
1. Navigate back to `/shop`
2. Click "Add Cart" on "Standard Project" ($150)
3. Go to cart

**Expected**:
- ✅ Both items show in cart
- ✅ Cart shows 4 items total (3 Quick Tasks + 1 Standard Project)
- ✅ Total is $300.00 (3×$50 + 1×$150)

---

### Test 6: Remove Item

**Action**: Click "Remove" on one of the Quick Task items

**Expected**:
- ✅ Item removed from cart
- ✅ Cart badge updates to 3
- ✅ Total updates to $200.00

---

### Test 7: Cart Persists After Refresh

**Action**:
1. Press F5 (refresh page)
2. Wait for page to load

**Expected**:
- ✅ Cart items still there
- ✅ Quantities and totals correct
- ✅ Cart badge still shows 3
- ✅ No error messages

---

### Test 8: Clear Cart and Start Fresh

**Action**:
1. Remove all items from cart
2. Navigate to `/shop`

**Expected**:
- ✅ Cart badge shows 0
- ✅ Can add new item without issues

---

## 🧪 E2E Test Suite (10 minutes)

### Run All Cart Tests

```bash
cd app
npm run test:e2e -- e2e/shop-cart.spec.ts
```

**Expected Results**:
- ✅ 8/8 tests pass
- ✅ No timeout errors
- ✅ All cart operations succeed

**If test fails**:
1. Read the error message carefully
2. Run single test in headed mode:
   ```bash
   npx playwright test e2e/shop-cart.spec.ts -k "can add single item" --headed
   ```
3. Watch the test run and see where it fails
4. Check cart implementation

---

### Run Full E2E Suite

```bash
cd app
npm run test:e2e
```

**Expected**:
- ✅ All tests pass
- ✅ No failures in other test files

**If new failures appear**:
- Likely not related to cart changes
- Check git for what changed
- Revert if necessary

---

## 🔍 Code Quality Checks (5 minutes)

### TypeScript Type Checking

```bash
cd app
npm run typecheck
```

**Expected**: ✅ 0 errors

**If errors**:
```
error TS2322: Type 'X' is not assignable to type 'Y'
```
Fix the types, don't ignore with `@ts-ignore`.

---

### ESLint Linting

```bash
cd app
npm run lint
```

**Expected**: ✅ 0 errors

---

### Build Test

```bash
cd app
npm run build
```

**Expected**: ✅ Build succeeds without errors

---

## 📊 Backend Verification (5 minutes)

### Verify Medusa Endpoints Directly

**Test cart creation**:
```bash
docker exec nextjs_app wget -q -O- --post-data='{}' \
  http://app:3000/api/cart 2>&1 | jq '.cart | {id, items, subtotal, total}'

# Expected output:
# {
#   "id": "cart_1765...",
#   "items": [],
#   "subtotal": 0,
#   "total": 0
# }
```

**Test add item**:
```bash
CART_ID="<cart_id_from_above>"

docker exec nextjs_app wget -q -O- \
  --post-data='{"variant_id":"variant_prod_1_default","quantity":2}' \
  --header='Content-Type: application/json' \
  "http://app:3000/api/cart/$CART_ID/items" 2>&1 | jq '.cart'

# Expected: Should return cart with 1 item, quantity 2, subtotal 10000
```

---

## 🐳 Docker/Container Health

### Check All Services

```bash
docker-compose ps
```

**All should show: "Up" and health status "healthy"**

### View Logs for Errors

```bash
# Recent errors
docker-compose logs --tail=50 app medusa

# If you see ERROR or exception, investigate:
# - Check .env.local variables
# - Check ports are available
# - Check Docker has resources
```

---

## 📝 Git Status

### Ensure Changes Are Clean

```bash
git status
```

**Expected**:
- ✅ No uncommitted changes (all staged or committed)
- ✅ No untracked files (except node_modules, .next, etc.)

### Check Commit History

```bash
git log --oneline -5
```

**Latest commit should be**:
```
Implement working ecommerce cart system with test coverage
```

---

## 🎯 Final Checklist

Before clicking merge on GitHub, check ALL:

- [ ] All 8 functional tests passed manually ✅
- [ ] E2E test suite passed (8/8 tests) ✅
- [ ] TypeScript has no errors ✅
- [ ] ESLint has no errors ✅
- [ ] `npm run build` succeeds ✅
- [ ] Medusa endpoints respond correctly ✅
- [ ] All containers are healthy ✅
- [ ] Browser DevTools console has no errors ✅
- [ ] Git status is clean ✅
- [ ] Commit message is descriptive ✅

---

## ⚠️ Common Failures & Fixes

### "Failed to add item to cart"

**Causes**:
1. Medusa not running: `docker-compose restart medusa`
2. Variant missing: Check product has variants in code
3. Cart API broken: Check Next.js logs

**Fix**:
```bash
docker-compose down && docker-compose up -d
sleep 10
docker-compose ps  # Verify all healthy
```

---

### E2E Test Timeout

**Cause**: Medusa taking too long to respond

**Fix**:
```bash
docker-compose logs medusa
# Check if it's logging errors
docker-compose restart medusa
sleep 5
npm run test:e2e -- e2e/shop-cart.spec.ts
```

---

### "localStorage.removeItem is not a function"

**Cause**: CartContext running on server-side during build

**Fix**: This is expected and handled. The code checks `typeof window` before using localStorage.

---

### Cart Shows Old Items After Restart

**Cause**: Browser cache + Medusa restart cleared in-memory carts

**Fix**: This is expected behavior. Clear localStorage:
```javascript
localStorage.removeItem('medusa_cart_id');
location.reload();
```

---

## 🎉 Success Criteria

✅ You're ready to merge when:

1. **All functional tests pass** - User can add/update/remove items without errors
2. **E2E test suite passes** - Automated tests validate the flow
3. **Code quality checks pass** - No TypeScript/ESLint errors
4. **Backend responds correctly** - Medusa cart endpoints work
5. **Fresh start works** - Clear localStorage, start fresh, works perfectly
6. **Containers are stable** - No restarts, all healthy

---

## 📋 Post-Merge Steps

After merging to `dev`:

1. **Tag the commit**:
   ```bash
   git tag cart-v1.0.0
   git push origin cart-v1.0.0
   ```

2. **Update CHANGELOG.md** with cart implementation details

3. **Notify team** that cart system is live on dev branch

4. **Monitor in dev** for 24 hours before promoting to main

---

## 🚨 Rollback Plan

If issues appear in dev:

```bash
# Go back to previous working commit
git revert <commit-hash>

# Or reset to previous version
git reset --hard HEAD~1
```

---

## Questions?

Refer to:
- [docs/CART_SYSTEM.md](./CART_SYSTEM.md) - Complete architecture guide
- [app/e2e/shop-cart.spec.ts] - Test examples
- [medusa/src/index.ts] - Backend implementation
