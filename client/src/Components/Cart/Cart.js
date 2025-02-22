import { Button, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux"
import "../styles.css"
import { CartItem } from "./CartItem";
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import EmptyCart from "./EmptyCart";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const Cart = () => {
    const navigator = useNavigate();
    var sum = 0;
    var discount = 0;
    var amount = 0;


    const cartItems = useSelector(state => state.cart);

    for (var i = 0; i < cartItems.length; i++) {
        sum = sum + cartItems[i].price.mrp;
        discount = discount + (cartItems[i].price.mrp - cartItems[i].price.cost);


    }
    amount = sum - discount;


    async function placeOrder() {

        if (!localStorage.getItem("userName")) {
           

            navigator("/login")
            window.location.reload()
        } else {

            const userName = localStorage.getItem("userName")

            try {
                const config = {
                    headers: {
                        "content-type": "application/json",
                    },
                }

                const orders = {
                    cartItems,
                    username: localStorage.getItem("userName")
                }
                const { data: { key } } = await axios.get("http://localhost:8080/getKey");

                const { data } = await axios.post("http://localhost:8080/placeOrder", {data:orders}, config);

                const order = data.order;

                var options = {
                    "key": key, // Enter the Key ID generated from the Dashboard
                    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                    "currency": "INR",
                    "name": "Arnav Ridham DEV",
                    "description": "Flipkart Clone Test Transaction",

                    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                    "handler": async function (response) {

                        const config = {
                            headers: {
                                "content-type": "application/json"
                            }
                        }
                        const razorpay_payment_id = (response.razorpay_payment_id);
                        const razorpay_order_id = (response.razorpay_order_id);
                        const razorpay_signature = (response.razorpay_signature)

                        try {
                            const data = await axios.post("http://localhost:8080/cartpaymentVerification", {
                                razorpay_order_id,
                                razorpay_payment_id,
                                razorpay_signature,
                                cartItems,
                                userName,
                            }, config)

                            navigator("/orders");
                            window.location.reload()


                        }
                        catch (e) {
                            console.log(e);
                        }


                    },
                    "prefill": {
                        "name": "Gaurav Kumar",
                        "email": "gaurav.kumar@example.com",
                        "contact": "9000090000"
                    },
                    "notes": {
                        "address": "Razorpay Corporate Office"
                    },
                    "theme": {
                        "color": "#3399cc"
                    }
                };


                const razor = new window.Razorpay(options);
                razor.on('payment.failed', function (response) {
                    alert("payment failed, try again")
                });
                razor.open();






            }
            catch (e) {
                console.log(`error ${e}`);
            }
        }
    }

    return (
        <>

            {
                cartItems.length ?
                    <Grid container className="cart-container">
                        <Grid item lg={9} md={9} sm={12} xs={12}>

                            <div className="cart-header">
                                <h3>My Cart ({cartItems.length})</h3>
                            </div>

                            <div className="carts-item-container">


                                {cartItems.map(item => {
                                    return <CartItem item={item} key={Math.random()} />
                                })}


                            </div>

                            <div className="place-order-container" >
                                <Button

                                    onClick={placeOrder}

                                    style={{
                                        textTransform: "capitalize"
                                    }} disableElevation variant="contained">Place Order</Button>
                            </div>

                        </Grid >

                        <Grid item lg={3} md={3} sm={12} xs={12}>
                            <div className="bill-container" style={{ textAlign: "left" }}>

                                <Table>
                                    <TableHead >
                                        <p> PRICE DETAILS</p>
                                    </TableHead>


                                    <TableRow >
                                        <TableCell>
                                            Price ({cartItems.length} item)
                                        </TableCell>
                                        <TableCell>
                                            &#8377;{sum}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell>
                                            Discount
                                        </TableCell>
                                        <TableCell style={{ color: "green", fontWeight: "500" }}>
                                            - &#8377;{discount}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            Delivery Charges
                                        </TableCell>
                                        <TableCell style={{ color: "green", fontWeight: "500" }}>
                                            FREE
                                        </TableCell>
                                    </TableRow>
                                    <TableRow >
                                        <TableCell style={{ color: "black", fontWeight: "bolder", fontSize: "16px" }}>
                                            Total Amount
                                        </TableCell>
                                        <TableCell style={{ color: "black", fontWeight: "bolder", fontSize: "16px" }}>
                                            &#8377;{amount}
                                        </TableCell>
                                    </TableRow>


                                </Table>
                                <p style={{ color: "green", fontFamily: "inter", fontWeight: "500" }}>You will save {discount} on this order</p>

                                <Button style={{ margin: "15px 0px" }} disableElevation variant="contained">Place Order</Button>

                            </div>


                        </Grid>



                    </Grid>
                    :
                    <EmptyCart />

            }
        </>
    )

}

