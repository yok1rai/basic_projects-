
BUN       ?= bun
SRC_DIR   := src
BUILD_DIR := build
MAIN      := $(SRC_DIR)/main.ts
NAME      := task-cli 
OUTPUT    := $(BUILD_DIR)/$(NAME)

PREFIX    ?= $(HOME)/.local
BIN_DIR   := $(PREFIX)/bin

SOURCES   := $(shell find $(SRC_DIR) -type f \( -name '*.ts' -o -name '*.js' \))

.DEFAULT_GOAL := build

.PHONY: build run install clean rebuild

build: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	@mkdir -p $(BUILD_DIR)
	$(BUN) build $(MAIN) --compile --outfile $@

run: build
	@./$(OUTPUT)

install: build
	@install -Dm755 $(OUTPUT) $(DESTDIR)$(BIN_DIR)/$(NAME)

uninstall: build 
	@rm -f $(DESTDIR)$(BIN_DIR)/$(NAME)

clean:
	@rm -rf $(BUILD_DIR)

rebuild: clean build

