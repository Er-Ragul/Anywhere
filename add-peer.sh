#!/bin/bash

private_key="$(wg genkey)"
public_key="$(echo $private_key | wg pubkey)"
wg set wg0 peer $public_key endpoint 192.168.52.134:5182 allowed-ips $address/32 persistent-keepalive 25
echo {\"private_key\": \"$private_key\", \"public_key\": \"$public_key\"}