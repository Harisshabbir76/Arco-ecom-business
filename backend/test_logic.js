
const testLogic = () => {
    const code = 'Haris123';
    const totalAmount = 2200;
    const products = [{
        productId: '69ac39254fb71ed8a0d427b2',
        name: 'plain leather bag',
        quantity: 1,
        price: 2200,
        category: 'bags'
    }];

    const discount = {
        code: 'Haris123',
        type: 'COUPON',
        targetCategories: ['Bags'],
        targetProducts: [],
        discountPercent: 20
    };

    const hasTarget = (discount.targetProducts && discount.targetProducts.length > 0) ||
        (discount.targetCategories && discount.targetCategories.length > 0);

    const targetCatsLower = (discount.targetCategories || []).map(cat => cat.trim().toLowerCase());

    console.log('Target Cats (Normalized):', JSON.stringify(targetCatsLower));

    let applicableAmount = 0;
    if (!hasTarget) {
        applicableAmount = totalAmount;
    } else {
        products.forEach(item => {
            const itemCat = (item.category || "").trim().toLowerCase();
            const isTargetProduct = discount.targetProducts.map(p => p.toString()).includes(item.productId);
            const isTargetCategory = itemCat && targetCatsLower.includes(itemCat);

            console.log(`Checking item: cat="${item.category}", normalized="${itemCat}", isMatch=${isTargetCategory}`);

            if (isTargetProduct || isTargetCategory) {
                applicableAmount += (item.price * item.quantity);
            }
        });
    }

    const couponSavings = (applicableAmount * discount.discountPercent) / 100;
    console.log('Applicable Amount:', applicableAmount);
    console.log('Coupon Savings:', couponSavings);
};

testLogic();
