@echo off
REM Define o título da janela do console para fácil identificação
TITLE Ferramenta de Desenvolvimento

REM --- Verificação e Instalação Condicional ---
echo Verificando dependencias...

REM Verifica se a pasta "node_modules" NÃO existe
IF NOT EXIST "node_modules" (
    echo.
    echo Pasta "node_modules" nao encontrada. Executando "npm install"...
    echo Por favor, aguarde. Isso pode levar alguns minutos.
    echo.
    REM O comando 'call' garante que o script continue após o npm terminar
    call npm install
    echo.
    echo Instalacao concluida com sucesso!
    echo.
) ELSE (
    echo Dependencias ja estao instaladas.
)


REM --- Execução dos Comandos em Única Janela ---
echo.
echo Iniciando Processo Matriz...

REM --- IMPORTANTE: SUBSTITUA OS COMANDOS ABAIXO ---
REM Coloque seus comandos diretamente aqui, em vez de usar "npm run".

REM O primeiro argumento entre aspas para o 'start' é o TÍTULO da nova janela.
start http://localhost:5173/
npm run dev

echo.
echo Processos iniciados! Verifique as novas janelas do terminal.
