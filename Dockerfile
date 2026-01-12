# Use Alpine as base image
FROM alpine

# Install required packages: WireGuard, Openssh, and other dependencies
RUN apk update && apk add --no-cache \
    wireguard-tools \
    openssh \
    iptables \
    bash \
    iproute2 \
    curl

# Create directory for WireGuard config
RUN mkdir -p /etc/wireguard

# Copy your Node.js app
WORKDIR /scripts

# Copy all shell scripts
COPY . .

# Generate SSH host keys
RUN ssh-keygen -A

# Create SSH directory
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

# Set root password (change this)
RUN echo "root:root" | chpasswd

# Allow root login & password auth
RUN sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config \
 && sed -i 's/#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Expose SSH port
EXPOSE 22 51820/udp

# Run sshd in foreground
ENTRYPOINT ["/usr/sbin/sshd", "-D"]