import { useEffect, useState } from "react";
import { LogOut, Package, ShoppingBag, Plus, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./Admin.css";

const emptyProduct = {
    name:"", description:"", price:"", category:"T-Shirts", subCategory:"", brand:"VÉRA",
    sizes:"S,M,L,XL", colors:"Black", style:"casual", occasion:"college", material:"Cotton",
    stock:"10", images:"", rating:"4.5", reviewCount:"0", isFeatured:false, isTrending:false,
    isNewArrival:true, discountPercentage:"0", tags:""
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [tab,setTab]=useState("products");
    const [products,setProducts]=useState([]);
    const [orders,setOrders]=useState([]);
    const [editing,setEditing]=useState(null);
    const [form,setForm]=useState(emptyProduct);
    const [loading,setLoading]=useState(true);

    const load = async () => {
        setLoading(true);
        const [p,o] = await Promise.all([
            apiFetch("/api/products").then(r=>r.json()),
            apiFetch("/api/orders/admin/all").then(r=>r.json())
        ]);
        setProducts(p.products || []); setOrders(o.orders || []); setLoading(false);
    };
    useEffect(()=>{load()},[]);

    const logoutAdmin=async()=>{await logout();navigate("/login",{replace:true});};

    const beginEdit = p => {
        setEditing(p._id);
        setForm({
            ...emptyProduct,
            ...p,
            sizes:(p.sizes||[]).join(", "),
            colors:(p.colors||[]).join(", "),
            style:(p.style||[]).join(", "),
            occasion:(p.occasion||[]).join(", "),
            tags:(p.tags||[]).join(", "),
            images:(p.images||[]).join("\n")
        });
        window.scrollTo({top:0,behavior:"smooth"});
    };

    const submitProduct=async e=>{
        e.preventDefault();
        const payload={
            ...form,
            price:Number(form.price), stock:Number(form.stock), rating:Number(form.rating),
            reviewCount:Number(form.reviewCount), discountPercentage:Number(form.discountPercentage),
            sizes:form.sizes.split(",").map(x=>x.trim()).filter(Boolean),
            colors:form.colors.split(",").map(x=>x.trim()).filter(Boolean),
            style:form.style.split(",").map(x=>x.trim()).filter(Boolean),
            occasion:form.occasion.split(",").map(x=>x.trim()).filter(Boolean),
            tags:form.tags.split(",").map(x=>x.trim()).filter(Boolean),
            images:form.images.split(/\n|,/).map(x=>x.trim()).filter(Boolean)
        };
        const response=await apiFetch(editing?`/api/products/${editing}`:"/api/products",{method:editing?"PUT":"POST",body:JSON.stringify(payload)});
        const data=await response.json();
        if(!response.ok){alert(data.message||"Failed");return;}
        setEditing(null);setForm(emptyProduct);load();
    };

    const deleteProduct=async id=>{
        if(!confirm("Delete this product?")) return;
        const response=await apiFetch(`/api/products/${id}`,{method:"DELETE"});
        if(response.ok) load(); else alert("Could not delete product");
    };

    const updateStatus=async(id,status)=>{
        const response=await apiFetch(`/api/orders/admin/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});
        if(response.ok) load(); else alert("Could not update order");
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div><p>STYLESYNC</p><strong>ADMIN PORTAL</strong></div>
                <div className="admin-header-actions"><button onClick={load}><RefreshCw size={17}/> Refresh</button><button onClick={logoutAdmin}><LogOut size={17}/> Logout</button></div>
            </header>
            <div className="admin-shell">
                <aside className="admin-sidebar">
                    <button className={tab==="products"?"active":""} onClick={()=>setTab("products")}><Package size={18}/> Products</button>
                    <button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}><ShoppingBag size={18}/> Orders <span>{orders.length}</span></button>
                    <div className="admin-stat"><small>Catalogue</small><strong>{products.length}</strong><span>Products</span></div>
                    <div className="admin-stat"><small>Orders</small><strong>{orders.length}</strong><span>Total orders</span></div>
                </aside>

                <main className="admin-content">
                    {tab==="products" ? <>
                        <div className="admin-title"><div><p>CATALOGUE</p><h1>{editing?"Edit Product":"Products"}</h1></div><button onClick={()=>{setEditing(null);setForm(emptyProduct)}}><Plus size={17}/> New Product</button></div>
                        <form className="product-admin-form" onSubmit={submitProduct}>
                            <h2>{editing?"Update product":"Add a product"}</h2>
                            <div className="admin-grid">
                                <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
                                <label>Brand<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label>
                                <label>Price<input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
                                <label>Stock<input required type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label>
                                <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["T-Shirts","Shirts","Jeans","Trousers","Dresses","Jackets","Shoes","Accessories"].map(x=><option key={x}>{x}</option>)}</select></label>
                                <label>Sub category<input value={form.subCategory} onChange={e=>setForm({...form,subCategory:e.target.value})}/></label>
                                <label>Sizes<input value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/></label>
                                <label>Colors<input value={form.colors} onChange={e=>setForm({...form,colors:e.target.value})}/></label>
                                <label>Style<input value={form.style} onChange={e=>setForm({...form,style:e.target.value})}/></label>
                                <label>Occasion<input value={form.occasion} onChange={e=>setForm({...form,occasion:e.target.value})}/></label>
                                <label>Material<input value={form.material} onChange={e=>setForm({...form,material:e.target.value})}/></label>
                                <label>Discount %<input type="number" value={form.discountPercentage} onChange={e=>setForm({...form,discountPercentage:e.target.value})}/></label>
                                <label className="wide">Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
                                <label className="wide">Product images <span className="field-help">One URL per line</span><textarea value={form.images} onChange={e=>setForm({...form,images:e.target.value})} placeholder="https://..."/></label>
                                <label className="wide">Tags<input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/></label>
                            </div>
                            <div className="admin-checks"><label><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={form.isTrending} onChange={e=>setForm({...form,isTrending:e.target.checked})}/> Trending</label><label><input type="checkbox" checked={form.isNewArrival} onChange={e=>setForm({...form,isNewArrival:e.target.checked})}/> New arrival</label></div>
                            <div className="admin-form-actions"><button type="submit">{editing?"UPDATE PRODUCT":"ADD PRODUCT"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(emptyProduct)}}>Cancel</button>}</div>
                        </form>
                        <div className="admin-product-list">
                            {loading?<p>Loading...</p>:products.map(p=><article key={p._id} className="admin-product-row">
                                <img src={getProductImage(p)} alt={p.name}/>
                                <div><strong>{p.name}</strong><span>{p.category} • ₹{p.price.toLocaleString("en-IN")} • Stock {p.stock}</span><small>{p.images?.length||0} image(s)</small></div>
                                <button onClick={()=>beginEdit(p)}><Pencil size={16}/></button><button className="danger" onClick={()=>deleteProduct(p._id)}><Trash2 size={16}/></button>
                            </article>)}
                        </div>
                    </> : <section>
                        <div className="admin-title"><div><p>FULFILMENT</p><h1>Customer Orders</h1></div></div>
                        {!orders.length?<p>No orders yet.</p>:orders.map(order=><article className="admin-order-card" key={order._id}>
                            <div className="admin-order-top"><div><strong>{order.orderNumber}</strong><span>{order.user?.name} • {order.user?.email}</span></div><select value={order.status} onChange={e=>updateStatus(order._id,e.target.value)}>{["Order Placed","Processing","Shipped","Delivered","Cancelled"].map(x=><option key={x}>{x}</option>)}</select></div>
                            <div className="admin-order-items">{order.items.map(i=><div key={`${order._id}-${i.product}-${i.size}`}><img src={getProductImage({images:[i.image],category:""})}/><span>{i.name} × {i.quantity}</span><strong>₹{(i.price*i.quantity).toLocaleString("en-IN")}</strong></div>)}</div>
                            <div className="admin-order-total">Total ₹{order.totalAmount.toLocaleString("en-IN")} • {order.paymentMethod}</div>
                        </article>)}
                    </section>}
                </main>
            </div>
        </div>
    );
};
export default AdminDashboard;
