var produtos = [];
var indexEditando = null;

$(document).ready(function () {
    atualizarTabela();

    // Adiciona a funcionalidade de cadastrar produto ao pressionar "Enter"
    $("#formulario-cadastro input").keypress(function (event) {
        if (event.which == 13) {
            cadastrarProduto();
        }
    });
});

function cadastrarProduto() {
    var ean = $("#ean").val();
    var nome = $("#nome").val();
    var marca = $("#marca").val();
    var modelo = $("#modelo").val();
    var estoque = $("#estoque").val();

    if (ean == "" || nome == "" || marca == "" || modelo == "" || estoque == "") {
        alert("Preencha todos os campos.");
        return;
    }

    // Verifica se já existe um produto com o mesmo EAN
    for (var i = 0; i < produtos.length; i++) {
        if (ean == produtos[i].ean && i != indexEditando) {
            alert("Já existe um produto com este EAN.");
            return;
        }
    }
    
    // Adiciona os dados a planilha
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: "192314815",
        range: "A1",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
            values: [
                [ean, nome, marca, modelo, estoque]
            ]
        }
    }).then(function(response) {
        console.log("Produto cadastrado com sucesso");
    }, function(response) {
        console.log("Erro ao cadastrar produto: " + response.result.error.message);
    });

    if (indexEditando == null) {
        // Adiciona os valores ao array de produtos
        produtos.push({
            ean: ean,
            nome: nome,
            marca: marca,
            modelo: modelo,
            estoque: estoque,
        });
    } else {
        produtos[indexEditando] = {
            ean: ean,
            nome: nome,
            marca: marca,
            modelo: modelo,
            estoque: estoque,
        };
        indexEditando = null;
    }

    // Atualiza a tabela
    atualizarTabela();
    clearForm();
}


function clearForm() {
    $("#ean").val("");
    $("#nome").val("");
    $("#marca").val("");
    $("#modelo").val("");
    $("#estoque").val("");
}

function atualizarTabela() {
    // Limpa a tabela antes de adicionar os novos valores
    $("#tabela-produtos").empty();

    // Adiciona os cabeçalhos da tabela
    $("#tabela-produtos").append("<tr>" + "<th>Código EAN</th>" + "<th>Nome do Produto</th>" + "<th>Marca</th>" + "<th>Modelo</th>" + "<th>Estoque</th>" + "<th>Ações</th>" + "</tr>");
    // Adiciona os valores dos produtos à tabela
    for (var i = 0; i < produtos.length; i++) {
        $("#tabela-produtos").append(
            "<tr>" +
                "<td>" +
                produtos[i].ean +
                "</td>" +
                "<td>" +
                produtos[i].nome +
                "</td>" +
                "<td>" +
                produtos[i].marca +
                "</td>" +
                "<td>" +
                produtos[i].modelo +
                "</td>" +
                "<td>" +
                produtos[i].estoque +
                "</td>" +
                "<td>" +
                "<button class='btn btn-warning' onclick='editarProduto(" +
                i +
                ")'>Editar</button>" +
                "<button class='btn btn-danger' onclick='excluirProduto(" +
                i +
                ")'>Excluir</button>" +
                "</td>" +
                "</tr>"
        );
    }
}

function editarProduto(index) {
    indexEditando = index;
    var produto = produtos[index];
    $("#ean").val(produto.ean);
    $("#nome").val(produto.nome);
    $("#marca").val(produto.marca);
    $("#modelo").val(produto.modelo);
    $("#estoque").val(produto.estoque);
    $("#cadastrar").text("Salvar");
}

function excluirProduto(index) {
    // Remove o produto do array
    produtos.splice(index, 1);

    // Atualiza a tabela
    atualizarTabela();
}

function importarCSV() {
    var file = $("#csv-import")[0].files[0];
    Papa.parse(file, {
        header: true,
        complete: function (results) {
            for (var i = 0; i < results.data.length; i++) {
                var produto = results.data[i];
                var ean = produto["Código EAN"];
                var nome = produto["Nome do Produto"];
                var marca = produto["Marca"];
                var modelo = produto["Modelo"];
                var estoque = produto["Estoque"];

                // Verifica se já existe um produto com o mesmo EAN
                var eanExistente = false;
                for (var j = 0; j < produtos.length; j++) {
                    if (ean == produtos[j].ean) {
                        eanExistente = true;
                        break;
                    }
                }

                if (!eanExistente) {
                    produtos.push({
                        ean: ean,
                        nome: nome,
                        marca: marca,
                        modelo: modelo,
                        estoque: estoque,
                    });
                }
            }
            // Atualiza a tabela
            atualizarTabela();
        },
    });
}

function exportCSV() {
    var csv = Papa.unparse(produtos);
    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    if (navigator.msSaveBlob) {
        csvURL = navigator.msSaveBlob(csvData, "produtos.csv");
    } else {
        csvURL = window.URL.createObjectURL(csvData);
    }
    var tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "produtos.csv");
    tempLink.click();
}

function pesquisarProduto() {
    var ean = $("#ean-pesquisa").val();
    for (var i = 0; i < produtos.length; i++) {
        if (ean == produtos[i].ean) {
            // Exibe o popup para ajustar o estoque
            var estoque = produtos[i].estoque;
            var novoEstoque = prompt("Estoque atual: " + estoque + "\n\nInforme a nova quantidade:", estoque);
            produtos[i].estoque = novoEstoque;
            atualizarTabela();
            return;
        }
    }
    // Caso o produto não seja encontrado, sugere adicioná-lo
    if (confirm("Produto não encontrado. Deseja adicioná-lo?")) {
        $("#ean").val(ean);
        $("#nome").focus();
    }
}
