package main

import "testing"

func TestReleaseSummary(t *testing.T) {
	for _, testCase := range []struct {
		name, input, want string
	}{
		{name: "normaliza entrega", input: "  ensaio Go  ", want: "LocalLabs: ensaio Go"},
		{name: "normaliza espacos internos", input: "ensaio   Go", want: "LocalLabs: ensaio Go"},
		{name: "descreve ausência", input: "  ", want: "LocalLabs: sem entrega"},
	} {
		t.Run(testCase.name, func(t *testing.T) {
			if got := releaseSummary(testCase.input); got != testCase.want {
				t.Errorf("releaseSummary(%q) = %q; want %q", testCase.input, got, testCase.want)
			}
		})
	}
}
