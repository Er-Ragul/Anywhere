#!/bin/bash

private_key="$(wg genkey)"
public_key="$(echo $private_key | wg pubkey)"

cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
PrivateKey = $private_key
Address = 10.0.0.1/24
ListenPort = 51820

# Enable IP forwarding and set up NAT using iptables
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -A FORWARD -o wg0 -j ACCEPT

# Clean up iptables rules on interface shutdown
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -D FORWARD -o wg0 -j ACCEPT
EOF

echo {\"private_key\": \"$private_key\", \"public_key\": \"$public_key\"}