#!/bin/bash

wg set wg0 peer $Public_key allowed-ips $address/32
echo "IP connection unblocked"
