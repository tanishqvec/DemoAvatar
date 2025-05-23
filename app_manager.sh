#!/bin/bash

action=$1

function check_python_installed() {
    command -v python3 >/dev/null 2>&1
}

function check_pip_installed() {
    command -v pip3 >/dev/null 2>&1 || command -v pip >/dev/null 2>&1
}

function install_dependencies() {
    echo "Installing platform-specific dependencies..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y build-essential libssl-dev wget
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Check if Homebrew is installed
        if ! command -v brew >/dev/null 2>&1; then
            echo -e "\e[31mHomebrew is not installed. Install it from https://brew.sh/\e[0m"
            exit 1
        fi
        brew install openssl wget
    else
        echo -e "\e[31mUnsupported OS: $OSTYPE\e[0m"
        exit 1
    fi
}

if [ "$action" == "configure" ]; then
    install_dependencies

    if ! check_python_installed; then
        echo -e "\e[31mPython 3 is not installed. Please install Python to proceed.\e[0m"
        exit 1
    fi

    if ! check_pip_installed; then
        echo -e "\e[31mpip is not installed. Please install pip (or pip3) to proceed.\e[0m"
        exit 1
    fi

    echo "Installing Python requirements..."
    if command -v pip3 >/dev/null 2>&1; then
        pip3 install -r requirements.txt
    else
        pip install -r requirements.txt
    fi

elif [ "$action" == "run" ]; then
    ENV_FILE=".env"

    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"

        export SPEECH_KEY=$SPEECH_RESOURCE_KEY
        export AZURE_OPENAI_API_KEY=$SPEECH_RESOURCE_KEY
        export SPEECH_REGION=$SERVICE_REGION
        export AZURE_OPENAI_ENDPOINT="https://${CUSTOM_SUBDOMAIN_NAME}.openai.azure.com/"
        echo "Environment variables loaded from $ENV_FILE"
    else
        echo "Environment file $ENV_FILE not found. Set secrets manually or provide a .env file."
    fi

    python3 -m flask run -h 0.0.0.0 -p 5080

else
    echo -e "\e[31mInvalid action: $action\e[0m"
    echo "Usage: $0 configure | run"
    exit 1
fi
