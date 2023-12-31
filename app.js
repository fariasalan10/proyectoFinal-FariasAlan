class Producto {
  constructor(id, nombre, precio, categoria, imagen) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

//Base de datos donde almacenamos todos nuestros productos
class BaseDeDatos {
  constructor() {
    //
    this.categoriaSeleccionada = "MLA1055";
    this.limiteProductos = 32;
    this.cargarRegistrosPorCategoria();
  }

  // Cargamos productos por categorías
  async cargarRegistrosPorCategoria(categoria = this.categoriaSeleccionada) {
    // Loader
    mostrarLoader();
    this.categoriaSeleccionada = categoria;
    // Array para el catálogo
    this.productos = [];
    const respuesta = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?category=${categoria}&limit=${this.limiteProductos}&offset=2`
    );
    const resultado = await respuesta.json();
    const productosML = resultado.results;
    for (const productoML of productosML) {
      const producto = new Producto(
        productoML.id,
        productoML.title,
        productoML.price,
        categoria,
        productoML.thumbnail_id
      );
      this.productos.push(producto);
    }
    cargarProductos(this.productos);
    // Cerramos librería sweetAlert activa
    Swal.close();
  }

  // Buscamos productos por nombre
  async cargarRegistrosPorNombre(palabra) {
    // Loader
    mostrarLoader();
    // Array para el catálogo
    this.productos = [];
    const respuesta = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?category=${this.categoriaSeleccionada}&q=${palabra}&limit=${this.limiteProductos}&offset=0
        `
    );
    const resultado = await respuesta.json();
    const productosML = resultado.results;
    for (const productoML of productosML) {
      const producto = new Producto(
        productoML.id,
        productoML.title,
        productoML.price,
        this.categoriaSeleccionada,
        productoML.thumbnail_id
      );
      this.productos.push(producto);
    }
    cargarProductos(this.productos);
    // Cerramos librería sweetAlert activa
    Swal.close();
  }

  // Traemos el catálogo completo
  traerRegistros() {
    return this.productos;
  }

  // Nos devuelve un producto según el ID
  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }
}

// Clase que usamos para manipular el carrito
class Carrito {
  constructor() {
    // Storage
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    // Array donde almacenamos los productos que agg al carrito
    this.carrito = carritoStorage || [];
    this.total = 0; // Total de los precios
    this.cantidadProductos = 0; // Cantidad de productos
    // Llamo a listar apenas de instancia el carrito para aplicar lo que
    // hay en el storage (en caso de que haya algo)
    this.listar();
  }

  // El prod ya está en el carrito?
  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  // Agregar al carrito
  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);
    // Si no está en el carrito, lo agg y le ponemos la propiedad "cantidad"
    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
      // Si ya está en el carrito, le sumamos 1
      productoEnCarrito.cantidad++;
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }

  // Quitar del carrito
  quitar(id) {
    // Obtengo el índice de un producto según el ID, para el splice
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    // Si la cantidad es mayor a 1, le resto la cantidad en 1
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      // Y sino, borramos del carrito el producto
      this.carrito.splice(indice, 1);
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }

  // Vaciar el carrito
  vaciar() {
    this.total = 0;
    this.cantidadProductos = 0;
    this.carrito = [];
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  // Mostrar todos los productos en el HTML
  listar() {
    // Reiniciamos variables
    this.total = 0;
    this.cantidadProductos = 0;
    divCarrito.innerHTML = "";
    // Recorro producto por producto del carrito, y los dibujo en el HTML
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
          <div class="card">
          <img src="https://http2.mlstatic.com/D_604790-${producto.imagen}-V.webp" class="card-img-top" alt="${producto.nombre}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text">Cantidad: ${producto.cantidad}</p>
            <p class="card-text">$${producto.precio}</p>
            <a href="#" class="btnQuitar botonCarrito" data-id="${producto.id}">Quitar del carrito</a>
          </div>
        </div>
        `;
      // Actualizamos totales
      this.total += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
    }
    if (this.cantidadProductos > 0) {
      // Botón comprar visible
      botonComprar.style.display = "block";
    } else {
      // Botón comprar invisible + frase comprá algo
      divCarrito.innerHTML += `<h2 class="tituloCarritoVacio">¡El producto que tanto deseás, encontralo en nuestra tienda!</h2>`;
      botonComprar.style.display = "none";
    }
    // Asignamos eventos a cada producto
    // Hacemos una lista de todos los botones
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    // Recorremos y le asignamos el evento a cada uno
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        // Obtengo el id por el dataset (está asignado en this.listar())
        const idProducto = boton.dataset.id;
        // Llamamos al método quitar pasándole el ID del producto
        this.quitar(idProducto);
      });
    }
    // Actualizo los contadores del HTML
    spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

// Elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

// Instanciamos base de datos
const bd = new BaseDeDatos();

// Instanciamos clase Carrito
const carrito = new Carrito();

// Botones de categorías
botonesCategorias.forEach((boton) => {
  boton.addEventListener("click", () => {
    const categoria = boton.dataset.categoria;
    // Quitar seleccionado anterior
    const botonSeleccionado = document.querySelector(".seleccionado");
    botonSeleccionado.classList.remove("seleccionado");
    // Se lo agrego a este botón
    boton.classList.add("seleccionado");
    bd.cargarRegistrosPorCategoria(categoria);
  });
});

// Mostramos el catálogo de prod de la base de datos apenas carga la página
cargarProductos(bd.traerRegistros());

// Función para mostrar productos del catálogo o buscador
function cargarProductos(productos) {
  // Vacíamos el div
  divProductos.innerHTML = "";
  // Recorremos producto por producto y lo dibujamos en el HTML
  for (const producto of productos) {
    divProductos.innerHTML += `

        <article class="container1">
        <div class="producto card1">
          <img src="https://http2.mlstatic.com/D_604790-${producto.imagen}-V.webp" alt="${producto.nombre}">
          <div class="contenido">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <a href="#" class="btnAgregar botonCarrito" data-id="${producto.id}">Agregar al carrito</a>
          </div>
        </div>
      </article>
      `;
  }

  // Lista dinámica con todos los botones que haya en nuestro catálogo
  const botonesAgregar = document.querySelectorAll(".btnAgregar");

  // Recorremos los botones de cada producto y le agregamos el evento click a cada uno
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      // Prevenimos comportamiento default
      event.preventDefault();
      // Guardamos el dataset ID que está en el HTML del botón Agregar al carrito
      const idProducto = boton.dataset.id;
      // Uso el método de la base de datos para ubicar el producto según el ID
      const producto = bd.registroPorId(idProducto);
      // Llamamos al método agregar del carrito
      carrito.agregar(producto);
      // Libreria
      Toastify({
        text: `Se ha añadido ${producto.nombre} al carrito`,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(to right, #d15280, #244ced)",
        },
      }).showToast();
    });
  }
}

// Función para mostrar el loader (libreria Sweet Alert)
function mostrarLoader() {
  Swal.fire({
    title: "Espere",
    html: "Estamos cargando productos...",
    timer: 1500,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

// Buscador
formBuscar.addEventListener("submit", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  bd.cargarRegistrosPorNombre(palabra);
});

// Toggle para ocultar/mostrar el carrito
botonCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});

// Botón comprar
botonComprar.addEventListener("click", (event) => {
  event.preventDefault();

  Swal.fire({
    title: "¿Desea comprar los productos?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, comprar",
    cancelButtonText: "No, cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.vaciar();
      Swal.fire({
        title: "¡Compra realizada!",
        icon: "success",
        text: "Tu compra fue realizada con éxito, disfrutá de tu producto. Gracias por confiar en iStore Córdoba.",
        timer: 3000,
      });
    }
  });
});
