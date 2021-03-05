const arreglo = []

for (let i = 0; i < 10; i++) {
    arreglo.push({
        id: i,
        nombre: "lucas" + i,
        Apellido: "Orozco" + i,
        años: i + i
    })
    
}
console.log(arreglo)