// {
// "invoices": [
//     {
//         "_id": "670887c937d42d54f831a265",
//         "invoice_ref": "TEST_IVC2001",
//         "supplier": "6684f2e5b8c9196c4081d9f9",
//         "invoice_issue_date": "2024-10-11T00:00:00.000Z",
//         "invoice_received_date": "2024-10-11T00:00:00.000Z",
//         "invoice_due_date": "2024-11-11T00:00:00.000Z",
//         "order": "66fe34090402e84be8bead22",
//         "products": [
//             {
//                 "product_obj_ref": "66fe393bd0c2f4da51b361cf",
//                 "invoice_product_location": "TEST",
//                 "invoice_product_qty_a": 0,
//                 "invoice_product_price_unit": 100,
//                 "invoice_product_gross_amount_a": 0,
//                 "_id": "67061035fb559f210d814282"
//             },
//             {
//                 "product_obj_ref": "6697229a70e1d4723d0bd832",
//                 "invoice_product_location": "TEST",
//                 "invoice_product_qty_a": 0,
//                 "invoice_product_price_unit": 74.37,
//                 "invoice_product_gross_amount_a": 0,
//                 "_id": "670622e0db7d62f43d567753"
//             },
//             {
//                 "product_obj_ref": "66907e46e79c95672dbb16cf",
//                 "invoice_product_location": "TEST",
//                 "invoice_product_qty_a": 0,
//                 "invoice_product_price_unit": 5,
//                 "invoice_product_gross_amount_a": 0,
//                 "_id": "670622e0db7d62f43d567754"
//             },
//             {
//                 "product_obj_ref": "6697229a70e1d4723d0bd832",
//                 "invoice_product_location": "Level 2",
//                 "invoice_product_qty_a": 0,
//                 "invoice_product_price_unit": 74.37,
//                 "invoice_product_gross_amount_a": 0,
//                 "_id": "67062578db7d62f43d569fc6"
//             }
//         ],
//         "custom_products": [
//             {
//                 "custom_product_name": "25mm Kingspan",
//                 "custom_product_location": "No location",
//                 "custom_order_qty": 3,
//                 "custom_order_price": 31,
//                 "custom_order_gross_amount": 93,
//                 "_id": "66ff88f1f887a2a022a90102"
//             },
//             {
//                 "custom_product_name": "10mm Slab",
//                 "custom_product_location": "No location",
//                 "custom_order_qty": 5,
//                 "custom_order_price": 24,
//                 "custom_order_gross_amount": 120,
//                 "_id": "6704648c4d661fa19f159f07"
//             }
//         ],
//         "invoiced_delivery_fee": 40,
//         "invoiced_other_fee": 0,
//         "invoiced_credit": 0,
//         "invoiced_raw_total_amount_incl_gst": 278.1,
//         "invoiced_calculated_total_amount_incl_gst": 278.3,
//         "invoice_is_stand_alone": false,
//         "invoice_internal_comments": "",
//         "invoice_isarchived": false,
//         "invoice_status": "To review",
//         "createdAt": "2024-10-11T02:04:57.897Z",
//         "updatedAt": "2024-10-11T02:04:57.897Z",
//         "__v": 0
//     }
//     ],
// "custom_products": [
//     {
//         "custom_product_name": "25mm Kingspan",
//         "custom_product_location": "No location",
//         "custom_order_qty": 15,
//         "_id": "66ff88f1f887a2a022a90102"
//     },
//     {
//         "custom_product_name": "10mm Slab",
//         "custom_product_location": "No location",
//         "custom_order_qty": 30,
//         "_id": "6704648c4d661fa19f159f07"
//     }
//     ]
// }

const currentOrder = {
    // Your currentOrder object here...
};

// Extract the list of product IDs from the 'products' array in the currentOrder
const productIds = currentOrder.products.map(product => product.product_obj_ref._id);

// Now, iterate over each invoice and check if the products match with any product ID
let totalQty = currentOrder.invoices.reduce((sum, invoice) => {
    const invoiceProductQtySum = invoice.products.reduce((invoiceSum, invoiceProduct) => {
        // Check if the current product's product_obj_ref is present in the currentOrder's products list
        if (productIds._id.includes(invoiceProduct._id)) {
            // Add the invoice product quantity to the sum if there's a match
            return invoiceSum + invoiceProduct.invoice_product_qty_a;
        }
        return invoiceSum;
    }, 0);

    return sum + invoiceProductQtySum;
}, 0);



// ! *****************************

{/* Based on previous invoice */}
<td className="border border-gray-300 px-1 py-2 bg-gray-100">
<label>{currentOrder.invoices.reduce((sum, invoice) => {
    // Reduce over each invoice to accumulate the quantities
    const invoiceProductQtySum = invoice.products.reduce((invoiceSum, invoiceProduct) => {
        // Check if the current product's _id matches the invoice product's product_obj_ref
        if (prod.product_obj_ref._id === invoiceProduct.product_obj_ref) {
            // Add the invoice product quantity to the sum if there's a match
            return invoiceSum + invoiceProduct.invoice_product_qty_a;
        }
        return invoiceSum;
    }, 0);

    return sum + invoiceProductQtySum;
}, 0)}</label>

<label className="ml-1 text-xs opacity-50 col-span-1 text-nowrap">
    {prod.productprice_obj_ref.product_unit_a}
</label>
</td>

// ! *****************************

const formattedProducts =
  data.products?.map((product, index) => ({
    _id: product._id,
    product_obj_ref: product.product_obj_ref._id,
    invoice_product_location: product.order_product_location,
    invoice_product_qty_a:
      newInvoice?.products[index]?.invoice_product_qty_a || 0,
    invoice_product_price_unit: product.order_product_price_unit_a,
    invoice_product_gross_amount_a:
      product.order_product_gross_amount *
      (newInvoice?.products[index]?.invoice_product_qty_a || 0),
  })) || [];

const formattedCustomProducts =
  data.custom_products?.map((customProduct, index) => {
    // Find if the customProduct exists in the invoices' custom_products
    let matchingCustomProduct = null;
    data.invoices.some(invoice => {
      matchingCustomProduct = invoice.custom_products.find(
        invoiceCustomProduct => invoiceCustomProduct._id === customProduct._id
      );
      return matchingCustomProduct;
    });

    return {
      _id: customProduct._id,
      custom_product_name: customProduct.custom_product_name,
      custom_product_location: customProduct.custom_product_location,
      custom_order_qty:
        newInvoice?.custom_products[index]?.custom_order_qty || 0,
      custom_order_price: matchingCustomProduct
        ? matchingCustomProduct.custom_order_price
        : '', // Set custom_order_price from matching invoice or empty string
      custom_order_gross_amount:
        (Number(customProduct.custom_order_gross_amount) || 0) *
        (Number(newInvoice?.custom_products[index]?.custom_order_qty) || 0),
    };
  }) || [];

setNewInvoice({
  ...newInvoice,
  order: id,
  products: formattedProducts,
  custom_products: formattedCustomProducts,
});