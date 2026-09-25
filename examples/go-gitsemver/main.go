package main

import (
	"fmt"
	"strings"
)

func releaseSummary(pName string) string {
	name := strings.TrimSpace(pName)
	if name == "" {
		return "LocalLabs: sem entrega"
	}
	return fmt.Sprintf("LocalLabs: %s", name)
}

func main() {
	fmt.Println(releaseSummary("exemplo mínimo para go-gitsemver"))
}
