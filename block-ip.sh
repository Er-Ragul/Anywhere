#!/bin/bash

wg set wg0 peer $Public_key allowed-ips 0.0.0.0/32
echo "IP connection blocked"
